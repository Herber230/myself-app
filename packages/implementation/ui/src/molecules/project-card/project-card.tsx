import { ProjectGlyph } from '../../atoms/project-glyph/project-glyph.js';
import { LinkCard } from '../link-card/link-card.js';

export interface ProjectCardData {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  /** The project's own page. */
  readonly href: string;
  /** The cue under the summary: "How it works". */
  readonly cue: string;
  /** What it is built with, by name, in the project's order. */
  readonly technologies?: readonly string[];
}

/**
 * A project on the landing page (#77): its glyph, its name, one sentence and
 * its technologies, as a `LinkCard` whose glyph redraws on hover and focus.
 */
export function ProjectCard({
  id,
  name,
  summary,
  href,
  cue,
  technologies,
}: ProjectCardData) {
  return (
    <LinkCard
      href={href}
      title={name}
      description={summary}
      tags={technologies}
      cue={cue}
      mark={<ProjectGlyph project={id} />}
    />
  );
}
