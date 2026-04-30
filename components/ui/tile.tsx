export function Tile({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-canvas border border-black/5 p-3">
      {label && (
        <div className="text-xs font-semibold uppercase tracking-wider text-grey mb-1">{label}</div>
      )}
      <div className="text-sm text-navy">{value}</div>
    </div>
  );
}
