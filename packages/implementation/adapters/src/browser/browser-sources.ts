import { Post } from '@myself-app/domain/entities/post';
import { Technology } from '@myself-app/domain/entities/technology';
import {
  type EntitySource,
  staticJsonSource,
} from '@myself-app/entifix-incubator-browser';

/**
 * Where the browser reads each entity the pages filter (ADR 0016): the files
 * the export writes under `/data/`, one per entity, fetched on first use.
 */
export interface BrowserSources {
  /** Every published post, without its body (ADR 0017). */
  readonly posts: EntitySource;
  readonly technologies: EntitySource;
}

export const browserSources: BrowserSources = {
  posts: staticJsonSource(Post, '/data/post.json'),
  technologies: staticJsonSource(Technology, '/data/technology.json'),
};
