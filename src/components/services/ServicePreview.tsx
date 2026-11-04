"use client";

import { AnimatePresence, motion, MotionConfig, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";

const SPRING = { stiffness: 220, damping: 28, mass: 0.5 };

/** The image that follows the cursor over the services list. Decorative. */
export default function ServicePreview({
  origin,
  image,
}: {
  origin: { x: number; y: number };
  image: string | null;
}) {
  const x = useMotionValue(origin.x);
  const y = useMotionValue(origin.y);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed top-0 left-0 z-30 hidden lg:block"
      >
        <AnimatePresence>
          {image && (
            <motion.div
              key={image}
              initial={{ opacity: 0, scale: 0.9, clipPath: "inset(12% 12% 12% 12%)" }}
              animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
              className="absolute -top-36 left-10 h-72 w-56 overflow-hidden"
            >
              <Image src={image} alt="" fill sizes="224px" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}
