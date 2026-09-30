import Link from 'next/link';

import { ProjectGlyph } from '../../atoms/project-glyph/project-glyph.js';

export interface ProjectCardData {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  /** The project's own page. */
  readonly href: string;
  /** The cue beside the name: "How it works". */
  readonly cue: string;
}

/**
 * A project on the landing page (#77): its glyph, its name and one sentence.
 * The name is the card's one link, stretched over the whole card (`site.css`),
 * so a screen reader hears one link named after the project rather than a
 * card of text; the card lifts and the glyph redraws on hover and focus.
 */
export function ProjectCard({ id, name, summary, href, cue }: ProjectCardData) {
  return (
    <article className="project-card">
      <ProjectGlyph project={id} />
      <div className="project-card-body">
        <h3 className="project-card-name">
          <Link href={href} className="project-card-link">
            {name}
          </Link>
        </h3>
        <p className="project-card-summary">{summary}</p>
        <span aria-hidden="true" className="project-card-cue">
          {cue}
        </span>
      </div>
    </article>
  );
}
