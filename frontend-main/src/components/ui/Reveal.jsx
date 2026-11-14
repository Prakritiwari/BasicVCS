import { motion, useReducedMotion } from "framer-motion";

export default function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 18,
  className = "",
  once = true,
  ...rest
}) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
