import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import useMediaQuery from "../../hooks/useMediaQuery";
import CopyButton from "../ui/CopyButton";
import Reveal from "../ui/Reveal";
import TerminalMock from "../ui/TerminalMock";
import { commands } from "./data";

export default function CommandsPinned() {
  const sectionRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isMobile) return undefined;

    function onScroll() {
      const node = sectionRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const trackHeight = node.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / trackHeight));
      const next = Math.min(commands.length - 1, Math.floor(progress * commands.length));
      setActive(next);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isMobile]);

  const goToStep = useCallback(
    (index) => {
      const node = sectionRef.current;
      if (!node) return;

      const trackHeight = node.offsetHeight - window.innerHeight;
      const top = node.offsetTop + trackHeight * (index / commands.length) + 2;
      setActive(index);
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [reducedMotion]
  );

  if (isMobile) {
    return (
      <section id="commands" className="commands commands-mobile">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">commands</span>
              <h2 className="display">
                Six commands.
                <br />
                That&apos;s the whole tool.
              </h2>
            </div>
            <p className="section-note">
              Copy one, run it in your project. No hidden flags, no subcommands of
              subcommands.
            </p>
          </div>

          <div className="mobile-command-list">
            {commands.map((command) => (
              <Reveal as="article" className="command-card" key={command.id}>
                <div className="command-card-head">
                  <span className="mono muted">{command.number}</span>
                  <h3>{command.title}</h3>
                  <p>{command.description}</p>
                </div>
                <TerminalMock
                  key={command.id}
                  command={command.command}
                  output={command.output}
                  label={`basicvcs — ${command.id}`}
                />
                <div className="command-card-foot">
                  <code className="mono">{command.command}</code>
                  <CopyButton text={command.command} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const current = commands[active];

  return (
    <section id="commands" className="commands commands-desktop" ref={sectionRef}>
      <div className="commands-track" style={{ height: `${commands.length * 100}vh` }}>
        <div className="commands-sticky">
          <div className="container commands-layout">
            <div className="commands-info">
              <span className="eyebrow">commands</span>
              <h2 className="commands-title">
                Six commands.
                <br />
                That&apos;s the whole tool.
              </h2>

              <div className="commands-counter mono" aria-live="polite">
                {active + 1}/{commands.length}
              </div>

              <div className="commands-step">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="mono muted">{current.number}</span>
                    <h3>{current.title}</h3>
                    <p>{current.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <ol className="commands-list">
                {commands.map((command, index) => (
                  <li key={command.id}>
                    <button
                      type="button"
                      className={index === active ? "is-active" : ""}
                      onClick={() => goToStep(index)}
                      aria-current={index === active ? "step" : undefined}
                    >
                      <span className="mono">{command.number}</span>
                      <span>{command.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="commands-terminal">
              <TerminalMock
                key={current.id}
                command={current.command}
                output={current.output}
                label={`basicvcs — ${current.id}`}
              />
              <div className="commands-copybar">
                <code className="mono">{current.command}</code>
                <CopyButton text={current.command} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
