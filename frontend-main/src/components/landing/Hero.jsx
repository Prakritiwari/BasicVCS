import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";
import { rotatingWords } from "./data";

export default function Hero() {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % rotatingWords.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const word = rotatingWords[index];

  return (
    <section className="hero">
      <div className="container hero-inner">
        <Reveal as="p" className="eyebrow">
          version control, from first principles
        </Reveal>

        <Reveal as="h1" className="hero-title" delay={0.06}>
          Version control,
          <br />
          built from scratch.
        </Reveal>

        <Reveal className="hero-rotator" delay={0.12}>
          <span className="hero-rotator-label mono">for</span>
          <span className="hero-rotator-window" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={word}
                className="hero-rotator-word"
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}.
              </motion.span>
            </AnimatePresence>
          </span>
        </Reveal>

        <Reveal as="p" className="hero-sub" delay={0.18}>
          Every commit lives in S3. Go back to any one with a single command.
        </Reveal>

        <Reveal className="hero-actions" delay={0.24}>
          <Button as={Link} to="/signup" size="lg" iconRight={<Icon name="arrow" size={16} />}>
            Get started
          </Button>
          <Button as="a" href="#commands" variant="secondary" size="lg">
            See the commands
          </Button>
        </Reveal>

        <Reveal className="hero-meta" delay={0.3}>
          <span className="mono hero-meta-label">six commands</span>
          <span className="hero-meta-rule" aria-hidden="true" />
          <div className="hero-meta-list mono">
            {["init", "add", "commit", "push", "pull", "revert"].map((cmd) => (
              <span key={cmd}>{cmd}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
