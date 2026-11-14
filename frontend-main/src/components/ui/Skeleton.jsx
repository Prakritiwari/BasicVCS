export function Skeleton({ width = "100%", height = 14, radius = 8, className = "", style }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <Skeleton width="46px" height="46px" radius={12} />
      <Skeleton width="65%" height={16} />
      <Skeleton width="90%" height={12} />
      {lines > 2 ? <Skeleton width="75%" height={12} /> : null}
      <Skeleton width="38%" height={10} style={{ marginTop: 8 }} />
    </div>
  );
}
