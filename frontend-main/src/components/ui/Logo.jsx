export default function Logo({ compact = false, size = "md" }) {
  return (
    <span className={`wordmark wordmark-${size}`} aria-label="BasicVCS">
      <span className="wordmark-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M7 4.8v8.4a4.3 4.3 0 0 0 4.3 4.3H17" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <circle cx="7" cy="4.6" r="2.3" fill="currentColor" />
          <circle cx="17.2" cy="17.5" r="2.3" fill="currentColor" />
          <circle cx="7" cy="17.4" r="2.3" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
      {!compact && <span className="wordmark-text">BasicVCS</span>}
    </span>
  );
}
