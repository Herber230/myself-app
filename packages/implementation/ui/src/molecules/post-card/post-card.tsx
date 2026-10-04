/**
 * A post's preview (ADR 0017): its title, when it was published, how long it
 * takes to read, what it says it is about — clamped to a few lines — and its
 * tags as chips, its technologies as a quiet line after them.
 *
 * Plain props, translated and formatted at build, so the blog's filter can
 * render the same card in the browser without the content's code.
 */
import { Text } from '@entifix/react-controls/primitives';
import Link from 'next/link';

export interface PostCardData {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly summary: string;
  /** ISO 8601, for `<time>`. */
  readonly publishedAt: string;
  /** The date, as the reader writes it. */
  readonly date: string;
  readonly readingTime: string;
  /** What a draft is called, on a draft only (`next dev`). */
  readonly draft?: string;
  readonly tags: readonly { readonly id: string; readonly label: string }[];
  readonly technologies: readonly {
    readonly id: string;
    readonly name: string;
  }[];
}

export function PostCard({
  post,
  heading = 'h2',
}: {
  post: PostCardData;
  heading?: 'h2' | 'h3';
}) {
  return (
    <article className="post-card" data-post={post.id}>
      <Text as={heading} step={1} weight="semibold">
        <Link href={post.href}>{post.title}</Link>
      </Text>
      <p className="post-card-meta">
        <time dateTime={post.publishedAt}>{post.date}</time>
        <span>{post.readingTime}</span>
        {post.draft && <span className="post-card-draft">{post.draft}</span>}
      </p>
      <p className="post-card-summary">{post.summary}</p>
      {/* What it is about as chips; what it uses, as a quiet line after. */}
      <div className="post-card-labels">
        <ul className="post-card-chips">
          {post.tags.map(tag => (
            <li key={`tag-${tag.id}`} className="landing-chip post-chip-tag">
              {tag.label}
            </li>
          ))}
        </ul>
        {post.technologies.length > 0 && (
          <ul className="post-card-techs">
            {post.technologies.map(technology => (
              <li key={`tech-${technology.id}`}>{technology.name}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
