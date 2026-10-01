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
}

/**
 * A project on the landing page (#77): its glyph, its name and one sentence,
 * as a `LinkCard` whose glyph redraws on hover and focus.
 */
export function ProjectCard({ id, name, summary, href, cue }: ProjectCardData) {
  return (
    <LinkCard
      href={href}
      title={name}
      description={summary}
      cue={cue}
      mark={<ProjectGlyph project={id} />}
    />
  );
}
