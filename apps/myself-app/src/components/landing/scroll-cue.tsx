/**
 * Says the page scrolls: an anchor to the first section, so it works with
 * scripting off. It appears after a few seconds and fades out as the page
 * scrolls; both are CSS (`global.css`, ADR 0011).
 */
export function ScrollCue({ href, label }: { href: string; label: string }) {
  return (
    <div className="scroll-cue">
      <a href={href} className="scroll-cue-link focus-ring">
        <span>{label}</span>
        <svg
          aria-hidden="true"
          className="scroll-cue-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </a>
    </div>
  );
}
