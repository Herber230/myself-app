/**
 * Posts as a timeline (ADR 0017): newest first, grouped by the year each was
 * published in, each a card on a line; the first featured when asked.
 */
import {
  PostCard,
  type PostCardData,
} from '../../molecules/post-card/post-card.js';

/** The posts, in their order, under the year each was published in. */
export function byYear(
  posts: readonly PostCardData[],
): [string, PostCardData[]][] {
  const years = new Map<string, PostCardData[]>();
  for (const post of posts) {
    const year = post.publishedAt.slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years];
}

export function PostTimeline({
  posts,
  featured,
}: {
  posts: readonly PostCardData[];
  /** The first post's label, to feature it: "Latest". None, none featured. */
  featured?: string;
}) {
  return (
    <div className="post-timeline">
      {byYear(posts).map(([year, inYear]) => (
        <section key={year} className="post-timeline-year">
          <h2 className="post-timeline-year-label">{year}</h2>
          <ol className="post-timeline-list">
            {inYear.map(post => (
              <li key={post.id} className="post-timeline-item">
                <PostCard
                  post={post}
                  heading="h3"
                  featured={post === posts[0] ? featured : undefined}
                />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
