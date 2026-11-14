const paths = {
  repos: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M4 16.5A2.5 2.5 0 0 1 6.5 14H19" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.2c.8-3.4 3.6-5.4 7.2-5.4s6.4 2 7.2 5.4" />
    </>
  ),
  logout: (
    <>
      <path d="M10 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H10" />
      <path d="m16 16.5 4.5-4.5L16 7.5" />
      <path d="M20 12H9.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.3 2.4 3.5 5.3 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.3-3.5-8.5S9.7 5.9 12 3.5Z" />
    </>
  ),
  arrow: (
    <>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19.5 12h-15" />
      <path d="m10.5 6-6 6 6 6" />
    </>
  ),
  check: <path d="m4.5 12 5 5L19.5 6.5" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4H6.5A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  issue: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4.2L19 9.2a2.1 2.1 0 0 0-3-3L5.2 17 4 20Z" />
      <path d="m14.5 7.5 3 3" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
      <path d="M10.5 11v5.5M13.5 11v5.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  branch: (
    <>
      <circle cx="6.5" cy="5.5" r="2.2" />
      <circle cx="17.5" cy="7" r="2.2" />
      <circle cx="6.5" cy="18.5" r="2.2" />
      <path d="M6.5 7.7v8.6" />
      <path d="M8.7 7.5c3.5 0 6.6 1.4 6.6 4.8v3.1" />
    </>
  ),
  command: (
    <>
      <path d="M9 9H7a2.5 2.5 0 1 1 2.5-2.5V9Zm0 0v6m0-6h6m-6 6H7a2.5 2.5 0 1 0 2.5 2.5V15Zm6-6h2a2.5 2.5 0 1 0-2.5-2.5V9Zm0 0v6m0 0h2a2.5 2.5 0 1 1-2.5 2.5V15Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.5 8.5 4.7L12 12.9 3.5 8.2 12 3.5Z" />
      <path d="m3.5 12.4 8.5 4.7 8.5-4.7" />
      <path d="m3.5 16.6 8.5 4.7 8.5-4.7" />
    </>
  ),
  file: (
    <>
      <path d="M6 3.5h7.5L19 9v11.5H6V3.5Z" />
      <path d="M13.5 3.5V9H19" />
    </>
  ),
  star: (
    <>
      <path d="m12 4 2.4 5 5.6.7-4 3.9 1 5.4-5-2.6-5 2.6 1-5.4-4-3.9 5.6-.7L12 4Z" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5.5" />
      <circle cx="12" cy="16.4" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  code: (
    <>
      <path d="m8.5 8-4.5 4 4.5 4" />
      <path d="m15.5 8 4.5 4-4.5 4" />
      <path d="m13.5 5-3 14" />
    </>
  ),
};

export default function Icon({ name, size = 18, strokeWidth = 1.6, ...rest }) {
  const path = paths[name];
  if (!path) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {path}
    </svg>
  );
}
