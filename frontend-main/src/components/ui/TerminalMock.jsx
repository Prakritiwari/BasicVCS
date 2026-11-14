import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import CopyButton from "./CopyButton";

export default function TerminalMock({
  command,
  output = [],
  label = "terminal",
  prompt = "$",
  copyable = true,
  className = "",
  autoStart = true,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = useReducedMotion();
  const [typed, setTyped] = useState(reducedMotion ? command : "");
  const [typedDone, setTypedDone] = useState(Boolean(reducedMotion));
  const [visibleOutput, setVisibleOutput] = useState(reducedMotion ? output.length : 0);

  const outputKey = output.join("\n");
  const outputLines = useMemo(
    () => (outputKey ? outputKey.split("\n") : []),
    [outputKey]
  );

  useEffect(() => {
    if (!autoStart || !inView) return undefined;

    if (reducedMotion) {
      setTyped(command);
      setTypedDone(true);
      setVisibleOutput(outputLines.length);
      return undefined;
    }

    let cancelled = false;
    let charIndex = 0;
    let typeTimer;
    let startTimer;

    setTyped("");
    setTypedDone(false);
    setVisibleOutput(0);

    function revealOutputs() {
      outputLines.forEach((_, index) => {
        window.setTimeout(() => {
          if (!cancelled) setVisibleOutput(index + 1);
        }, 260 * (index + 1));
      });
    }

    function type() {
      if (cancelled) return;
      charIndex += 1;
      setTyped(command.slice(0, charIndex));

      if (charIndex < command.length) {
        typeTimer = window.setTimeout(type, 24);
      } else {
        setTypedDone(true);
        revealOutputs();
      }
    }

    startTimer = window.setTimeout(type, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(typeTimer);
    };
  }, [inView, autoStart, command, outputLines, reducedMotion]);

  return (
    <div ref={ref} className={`terminal ${className}`.trim()}>
      <div className="terminal-head">
        <span className="terminal-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="terminal-title mono">{label}</span>
        {copyable ? <CopyButton text={command} compact label={`Copy ${command}`} /> : null}
      </div>

      <pre className="terminal-body mono" aria-hidden="true">
        <span className="terminal-line">
          <span className="terminal-prompt">{prompt}</span>
          <span className="terminal-command">{typed}</span>
          {!typedDone ? <span className="terminal-cursor" /> : null}
        </span>
        {output.slice(0, visibleOutput).map((line) => (
          <span className="terminal-line terminal-output" key={line}>
            {line}
          </span>
        ))}
      </pre>

      <span className="visually-hidden">
        {command}
        {output.length ? `. Output: ${output.join(" ")}` : ""}
      </span>
    </div>
  );
}
