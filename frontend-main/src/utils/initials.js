export default function initialsOf(name) {
  const parts = String(name || "U")
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (!parts.length) return "U";

  const first = parts[0];
  const second = parts[1];

  // Prefer the first letters of two words, but never fall back to digits
  // (test accounts like "user_1739" should render "US", not "U1").
  if (second && /^[A-Za-z]/.test(second)) {
    return (first[0] + second[0]).toUpperCase();
  }

  return first.slice(0, 2).toUpperCase();
}
