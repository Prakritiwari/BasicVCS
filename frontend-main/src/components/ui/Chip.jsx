export default function Chip({ tone = "neutral", dot, children, className = "" }) {
  const dotClass = dot ? `chip-dot chip-dot-${dot}` : null;

  return (
    <span className={`chip chip-${tone} ${className}`.trim()}>
      {dotClass ? <span className={dotClass} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function StatusChip({ status }) {
  const normalized = status === "closed" ? "closed" : "open";
  return (
    <Chip
      dot={normalized === "open" ? "green" : "red"}
      tone={normalized === "open" ? "sage" : "blush"}
    >
      {normalized === "open" ? "Open" : "Closed"}
    </Chip>
  );
}
