import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useClassicMotion } from "./motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { fadeUp, reduce } = useClassicMotion();
  return (
    <motion.div
      className={className}
      {...fadeUp}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }
      }
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 max-w-2xl sm:mb-10">
      {eyebrow ? (
        <p className="mb-2 font-ui text-[11px] tracking-[0.22em] text-sand uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-3xl font-semibold tracking-wide text-paper sm:text-4xl">{title}</h2>
      {children ? <p className="mt-3 font-ui text-[15px] leading-7 text-paper/75">{children}</p> : null}
    </header>
  );
}
