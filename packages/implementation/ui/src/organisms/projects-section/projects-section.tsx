import { localize, type LocalizedText } from '@myself-app/domain';
import type { FeaturedProject } from '@myself-app/domain/use-cases';

import { siteT } from '../../i18n/server.js';
import { LandingSection } from '../../molecules/landing-section/landing-section.js';
import { ProjectCard } from '../../molecules/project-card/project-card.js';
import { projectPath } from '../../routing/project-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';

/**
 * The featured projects (#30, #77), one above the other in their order: what
 * each is, in a sentence, and a card leading to its own page — where its
 * technologies, patterns, file tree and decisions are.
 */
export function ProjectsSection({
  locale,
  projects,
}: {
  locale: SiteLocale;
  projects: readonly FeaturedProject[];
}) {
  const t = siteT(locale);
  return (
    <LandingSection id="projects" locale={locale}>
      <ul className="landing-list project-card-list">
        {projects.map(({ project }) => {
          const id = String(project.id);
          return (
            <li key={id}>
              <ProjectCard
                id={id}
                name={project.name}
                // Validation requires a summary in every locale.
                summary={localize(project.summary as LocalizedText, locale)}
                href={projectPath(locale, id)}
                cue={t('projectPage.explore')}
              />
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
