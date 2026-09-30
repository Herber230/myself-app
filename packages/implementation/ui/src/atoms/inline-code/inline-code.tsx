import { Fragment } from 'react';

/**
 * Text whose backtick spans are code, as Markdown writes them: a decision
 * record's `Read when` line, or one of its key points (#77). A backtick left
 * unmatched stays a backtick.
 */
export function InlineCode({ text }: { text: string }) {
  const parts = text.split('`');
  // An even count of parts means one backtick has no partner: rejoin it.
  if (parts.length % 2 === 0) {
    const last = parts.pop() as string;
    parts.push(`${parts.pop() as string}\`${last}`);
  }
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index % 2 === 1 ? <code>{part}</code> : part}
        </Fragment>
      ))}
    </>
  );
}
