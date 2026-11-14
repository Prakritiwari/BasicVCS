export function shortHash(value = "", length = 8) {
  return String(value).slice(0, length);
}

export function parseObjectIdDate(id) {
  const value = String(id || "");
  if (!/^[a-f0-9]{24}$/i.test(value)) return null;
  return new Date(parseInt(value.slice(0, 8), 16) * 1000);
}

export function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatShortDate(value) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function timeAgo(value) {
  const date = toDate(value);
  if (!date) return "—";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function repoDate(repo) {
  return (
    toDate(repo?.updatedAt) ||
    toDate(repo?.createdAt) ||
    parseObjectIdDate(repo?._id) ||
    null
  );
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
