import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

export default function CopyButton({ text, label = "Copy", className = "", compact = false }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className={`copy-btn${compact ? " copy-btn-compact" : ""} ${className}`.trim()}
      onClick={copy}
      aria-label={copied ? "Copied" : label}
    >
      <Icon name={copied ? "check" : "copy"} size={13} />
      {compact ? null : <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
