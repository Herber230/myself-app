/**
 * Where a decision record stands (#77), as a chip whose colour the status
 * picks (`site.css`, `[data-status]`). The label is translated by the caller.
 */
export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span className="adr-status" data-status={status}>
      {label}
    </span>
  );
}
