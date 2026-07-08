'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 1.2,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix;
  });
  const [display, setDisplay] = useState(prefix + '0' + suffix);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const controls = animate(count, value, { duration, ease: 'easeOut' });
          return () => controls.stop();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, count]);

  useEffect(() => {
    return rounded.on('change', (v) => setDisplay(v));
  }, [rounded]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
