import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function Loader() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(!reducedMotion);
  const [count, setCount] = useState(reducedMotion ? 100 : 0);

  useEffect(() => {
    if (reducedMotion) return undefined;

    let value = 0;
    let hideTimer;

    const timer = window.setInterval(() => {
      value = Math.min(100, value + 4);
      setCount(value);

      if (value >= 100) {
        window.clearInterval(timer);
        hideTimer = window.setTimeout(() => setVisible(false), 420);
      }
    }, 32);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(hideTimer);
    };
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="loader"
          role="status"
          aria-label="Loading BasicVCS"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="loader-top mono">
            <span>basicvcs</span>
            <span>first principles</span>
          </div>

          <div className="loader-center">
            <span className="loader-count mono">{String(count).padStart(3, "0")} %</span>
          </div>

          <div className="loader-foot">
            <span className="loader-track" aria-hidden="true">
              <span className="loader-fill" style={{ width: `${count}%` }} />
            </span>
            <span className="mono">loading the loop</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
