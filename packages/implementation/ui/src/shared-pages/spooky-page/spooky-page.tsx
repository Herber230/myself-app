import type { ReactNode } from 'react';

import { SPOOKY_COPY as COPY } from './copy.js';
import { EntangledGhosts } from './entangled-ghosts.js';
import { ButtonGlyph, GhostGlyph, HeartGlyph, PumpkinGlyph } from './glyphs.js';
import { NightScene } from './night-scene.js';
import { SpookyParallax } from './parallax.js';

/** Where the stitches cross the ending's seam. */
const STITCHES = [12, 31, 50, 69, 88] as const;

/** The pumpkins and hearts drifting across the hero: where each starts, and its pace. */
const DRIFTERS = [
  { left: '6%', delay: '0s', size: 'm', kind: 'pumpkin' },
  { left: '18%', delay: '-9s', size: 's', kind: 'heart' },
  { left: '30%', delay: '-7s', size: 's', kind: 'pumpkin' },
  { left: '44%', delay: '-15s', size: 's', kind: 'heart' },
  { left: '56%', delay: '-3s', size: 's', kind: 'pumpkin' },
  { left: '66%', delay: '-12s', size: 'm', kind: 'heart' },
  { left: '76%', delay: '-11s', size: 'm', kind: 'pumpkin' },
  { left: '92%', delay: '-5s', size: 's', kind: 'heart' },
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="spooky-section" aria-labelledby={id}>
      <h2 id={id} className="spooky-heading">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Paragraphs({ items }: { items: readonly string[] }) {
  return items.map(text => <p key={text}>{text}</p>);
}

/**
 * `/for/spooky/`: quantum entanglement, told as two ghosts, with a demo to
 * try it and the story of Einstein's phrase. A shared page: English only,
 * reached by its link alone, and dressed in its own palette (`spooky.css`).
 */
export function SpookyPageView() {
  return (
    <div className="spooky-page">
      <div className="spooky-stars" aria-hidden="true" />
      <SpookyParallax />
      <header className="spooky-hero">
        <div className="spooky-drift" aria-hidden="true">
          {DRIFTERS.map(({ left, delay, size, kind }) => (
            <span
              key={left}
              className="spooky-drifter"
              data-size={size}
              style={{ left, animationDelay: delay }}
            >
              {kind === 'heart' ? <HeartGlyph /> : <PumpkinGlyph />}
            </span>
          ))}
        </div>
        <GhostGlyph className="spooky-hero-ghost" />
        <p className="spooky-greeting">{COPY.hero.greeting}</p>
        <p className="spooky-intro">{COPY.hero.intro}</p>
        {/* One question, read as one heading: the ask, then the name. */}
        <h1 className="spooky-question">
          <span className="spooky-ask">{COPY.hero.ask}</span>
          <span className="spooky-title">{COPY.hero.title}</span>
        </h1>
        <a className="spooky-cue" href="#secret">
          {COPY.hero.cue}
        </a>
      </header>
      <main className="spooky-main">
        <Section id="secret" title={COPY.secret.title}>
          <Paragraphs items={COPY.secret.paragraphs} />
        </Section>
        <Section id="demo" title={COPY.demo.title}>
          <p>{COPY.demo.hint}</p>
          <EntangledGhosts />
        </Section>
        <Section id="letter" title={COPY.letter.title}>
          <Paragraphs items={COPY.letter.paragraphs} />
          <blockquote className="spooky-quote" lang="de">
            <p>{COPY.letter.quote}</p>
            <footer lang="en">{COPY.letter.gloss}</footer>
          </blockquote>
        </Section>
        <Section id="real" title={COPY.real.title}>
          <Paragraphs items={COPY.real.paragraphs} />
        </Section>
        <div className="spooky-buttons" aria-hidden="true">
          <ButtonGlyph />
          <ButtonGlyph />
          <ButtonGlyph />
        </div>
        <section className="spooky-finale" aria-labelledby="finale">
          <div className="spooky-finale-art" aria-hidden="true">
            <GhostGlyph className="spooky-finale-ghost" />
            {/* Stitched together: a seam, and the stitches across it. */}
            <svg className="spooky-finale-thread" viewBox="0 0 100 20">
              <path className="spooky-seam" d="M2 10h96" />
              {STITCHES.map(x => (
                <path
                  key={x}
                  className="spooky-stitch"
                  d={`M${x - 3} 4l6 12`}
                />
              ))}
            </svg>
            <GhostGlyph className="spooky-finale-ghost" />
          </div>
          <Paragraphs items={COPY.finale.lines} />
          <h2 id="finale" className="spooky-finale-ask">
            {COPY.finale.ask}
          </h2>
        </section>
      </main>
      <NightScene />
    </div>
  );
}
