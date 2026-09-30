#!/usr/bin/env node
/**
 * Copies the architecture decision records of this repository and of entifix
 * into the content package (#77, ADR 0020): one record per ADR in
 * `packages/content/src/adrs.json`, and its Markdown, header lines stripped,
 * in `packages/content/src/adrs/<project>-<number>.md`.
 *
 *   node tools/sync-adrs.mjs            write the copies
 *   node tools/sync-adrs.mjs --check    fail if this repository's copies drift
 *
 * entifix is read from `$ENTIFIX_REPO` (default `../../r10c/entifix`, beside
 * this checkout). When it is not there, its copies are kept as they are: only
 * this repository's records are checked, since only they are always at hand.
 *
 * What a record's header says becomes its fields:
 *
 * - `# 16. Title` gives the number and the title;
 * - `- Status: Accepted; superseded in part by [ADR 0011](…)` gives the
 *   status, and puts this record in 0011's `supersedes`;
 * - `- Date:`, `- Area:` and `- Read when:` are copied;
 * - `- Revised:` lines stay, at the top of the body: a record's facts are
 *   corrected in place, and the corrections are part of what it says.
 *
 * Links between records become the site's pages for them
 * (`/projects/<project>/adr/0016/`); any other relative link becomes the file
 * on GitHub.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format } from 'prettier';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(REPO_ROOT, 'packages/content/src');
const RECORDS_FILE = join(CONTENT, 'adrs.json');
const BODIES = join(CONTENT, 'adrs');

/** The repositories whose records the site shows, and where each lives. */
export const PROJECTS = [
  {
    id: 'myself-app',
    github: 'Herber230/myself-app',
    directory: join(REPO_ROOT, 'docs/adr'),
  },
  {
    id: 'entifix',
    github: 'r10c-technologies/entifix',
    directory: join(
      resolve(REPO_ROOT, process.env.ENTIFIX_REPO ?? '../../r10c/entifix'),
      'docs/adr',
    ),
  },
];

const RECORD_FILE = /^(\d{4})-.*\.md$/;
const HEADER = /^- ([A-Za-z ]+): (.*)$/;
const RECORD_LINK = /\[ADR (\d{4})\]/;

/** Where a record stands, and which record replaced it, from its Status line. */
function statusOf(line, source) {
  const text = line.toLowerCase();
  const by = RECORD_LINK.exec(line)?.[1];
  if (text.includes('superseded in part by')) {
    return { status: 'superseded-in-part', by };
  }
  if (text.startsWith('superseded')) return { status: 'superseded', by };
  if (text.startsWith('accepted')) return { status: 'accepted' };
  if (text.startsWith('proposed')) return { status: 'proposed' };
  throw new Error(`${source}: a status this script does not know: ${line}`);
}

/** Links to other records become their pages; other relative links, GitHub's. */
function rewriteLinks(markdown, project) {
  return markdown.replace(/\]\(([^)\s]+)\)/g, (whole, url) => {
    if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(url)) return whole;
    const [path, anchor] = url.split('#');
    const record = RECORD_FILE.exec(posix.basename(path));
    if (record && !path.includes('/')) {
      return `](/projects/${project.id}/adr/${record[1]}/${anchor ? `#${anchor}` : ''})`;
    }
    const file = posix.normalize(posix.join('docs/adr', path));
    return `](https://github.com/${project.github}/blob/main/${file}${anchor ? `#${anchor}` : ''})`;
  });
}

/** Markdown as plain text: a link's words, without its target. */
function plainText(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The first `count` sentences of a text. */
function sentences(text, count) {
  return text
    .split(/(?<=[.!?]) (?=[A-Z`§])/)
    .slice(0, count)
    .join(' ');
}

/** A text cut at a word to `limit` characters, marked when it is. */
function clipped(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, text.lastIndexOf(' ', limit - 1))}…`;
}

/** A warning's sign, which leads some bullets: `⚠️ **Never …**`. */
const WARNING = /^⚠️\s*/u;

/**
 * One bullet or paragraph as a point: its bold lead, with the sentence after
 * it when the lead alone is only a name (`Tailwind v4, CSS-first`), else its
 * first sentence.
 */
function pointOf(block) {
  const text = block.replace(WARNING, '');
  const lead = /^\*\*(.+?)\*\*/.exec(text)?.[1];
  if (lead === undefined) return clipped(sentences(plainText(text), 1), 160);
  const rest = plainText(text.slice(lead.length + 4));
  const name = plainText(lead);
  if (name.split(' ').length >= 4 || rest === '') return name;
  // `**Routes carry the locale**: …` reads on without a space.
  const joint = /^[,:;.]/.test(rest) ? '' : ' ';
  return clipped(`${name}${joint}${sentences(rest, 1)}`, 160);
}

/**
 * A record's decision in a few lines, from its `Decision` section: a point
 * per paragraph that opens in bold and per top-level bullet, at most five,
 * when there are two or more; else the first two sentences of its first
 * paragraph. A paragraph that opens in plain text is context, not a point.
 */
function summaryOf(markdown) {
  const section = /^## Decision\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(
    markdown,
  )?.[1];
  if (section === undefined) return undefined;
  const blocks = section
    .replace(/^```[\s\S]*?^```/gm, '')
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(block => block !== '' && !/^(#|\||>)/.test(block));
  const points = blocks.flatMap(block => {
    if (block.startsWith('- ')) {
      return block
        .split(/^- /m)
        .filter(Boolean)
        .map(bullet => pointOf(bullet.trim()));
    }
    return block.replace(WARNING, '').startsWith('**') ? [pointOf(block)] : [];
  });
  // Each a sentence, as a lead written as a heading (`Content is its own
  // package`) is not.
  const ended = points.map(point =>
    /[.!?…:]$/.test(point) ? point : `${point}.`,
  );
  if (ended.length >= 2) return ended.slice(0, 5).join('\n');
  const first = blocks.find(block => !block.startsWith('- '));
  return first && clipped(sentences(plainText(first), 2), 280);
}

/** One record file, read into its fields and its body. */
function readRecord(project, file) {
  const source = `${project.id}/${file}`;
  const lines = readFileSync(join(project.directory, file), 'utf8').split('\n');
  const title = /^# (\d+)\. (.+)$/.exec(lines[0] ?? '');
  if (!title) throw new Error(`${source}: the first line is not "# N. Title"`);

  const fields = {};
  const revisions = [];
  let index = 1;
  while (index < lines.length && lines[index].trim() === '') index += 1;
  for (; index < lines.length && HEADER.test(lines[index]); index += 1) {
    const [, key, value] = HEADER.exec(lines[index]);
    if (key === 'Revised') revisions.push(lines[index]);
    else fields[key] = value;
  }
  for (const key of ['Status', 'Date', 'Area']) {
    if (fields[key] === undefined) throw new Error(`${source}: no ${key} line`);
  }

  const number = Number(title[1]);
  const { status, by } = statusOf(fields.Status, source);
  const rest = lines.slice(index).join('\n').trim();
  const body = [revisions.join('\n'), rest].filter(Boolean).join('\n\n');
  const summary = summaryOf(rest);
  return {
    record: {
      id: `${project.id}-${String(number).padStart(4, '0')}`,
      number,
      title: title[2].trim(),
      status,
      date: fields.Date,
      area: fields.Area,
      ...(fields['Read when'] && { readWhen: fields['Read when'] }),
      ...(summary && { summary }),
      project: project.id,
      supersedes: [],
    },
    by: by && `${project.id}-${by}`,
    body: `${rewriteLinks(body, project)}\n`,
  };
}

/** Every record of a project, with `supersedes` filled from the statuses. */
function readProject(project) {
  const read = readdirSync(project.directory)
    .filter(file => RECORD_FILE.test(file))
    .sort()
    .map(file => readRecord(project, file));
  const byId = new Map(read.map(each => [each.record.id, each.record]));
  for (const { record, by } of read) {
    if (by === undefined) continue;
    const replacing = byId.get(by);
    if (replacing === undefined) {
      throw new Error(
        `${record.id} is superseded by ${by}, which does not exist`,
      );
    }
    replacing.supersedes.push(record.id);
  }
  return read;
}

const formatted = async (text, parser) =>
  format(text, { parser, singleQuote: true, arrowParens: 'avoid' });

/**
 * Every project's records as they should be written: read from its repository
 * when it is at hand, else as already copied.
 */
async function expected() {
  const existing = existsSync(RECORDS_FILE)
    ? JSON.parse(readFileSync(RECORDS_FILE, 'utf8'))
    : [];
  const records = [];
  const bodies = new Map();
  const skipped = [];
  for (const project of PROJECTS) {
    if (!existsSync(project.directory)) {
      skipped.push(project.id);
      records.push(...existing.filter(record => record.project === project.id));
      continue;
    }
    for (const { record, body } of readProject(project)) {
      records.push(record);
      bodies.set(record.id, await formatted(body, 'markdown'));
    }
  }
  return {
    json: await formatted(JSON.stringify(records), 'json'),
    records,
    bodies,
    skipped,
  };
}

/** The differences between this repository's copies and its records. */
export async function drift(project = 'myself-app') {
  const { records, bodies } = await expected();
  const problems = [];
  const written = existsSync(RECORDS_FILE)
    ? JSON.parse(readFileSync(RECORDS_FILE, 'utf8')).filter(
        record => record.project === project,
      )
    : [];
  const wanted = records.filter(record => record.project === project);
  if (JSON.stringify(written) !== JSON.stringify(wanted)) {
    problems.push(
      `adrs.json does not hold ${project}'s records as docs/adr has them`,
    );
  }
  for (const record of wanted) {
    const path = join(BODIES, `${record.id}.md`);
    const copy = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
    if (copy !== bodies.get(record.id))
      problems.push(`adrs/${record.id}.md is out of date`);
  }
  return problems;
}

async function main() {
  if (process.argv.includes('--check')) {
    const problems = await drift();
    if (problems.length > 0) {
      console.error(`${problems.join('\n')}\nRun: node tools/sync-adrs.mjs`);
      process.exit(1);
    }
    return;
  }
  const { json, records, bodies, skipped } = await expected();
  mkdirSync(BODIES, { recursive: true });
  writeFileSync(RECORDS_FILE, json);
  for (const [id, body] of bodies)
    writeFileSync(join(BODIES, `${id}.md`), body);
  console.log(
    `${records.length} records written${skipped.length > 0 ? `; kept the copies of ${skipped.join(', ')}, not found` : ''}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
