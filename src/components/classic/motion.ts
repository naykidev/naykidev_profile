import { useReducedMotion } from "framer-motion";

export function useClassicMotion() {
  const reduce = useReducedMotion();
  return {
    reduce: Boolean(reduce),
    fadeUp: reduce
      ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 22 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-8% 0px" },
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
        },
    stagger: reduce ? 0 : 0.08,
  };
}
