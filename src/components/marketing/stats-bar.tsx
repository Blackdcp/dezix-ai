"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";

function CountUp({
  target,
  suffix,
  prefix,
}: {
  target: number;
  suffix: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

export function StatsBar() {
  const t = useTranslations("Stats");

  const stats = [
    { value: 90, suffix: "+", label: t("aiModels") },
    { value: 13, suffix: "+", label: t("providers") },
    { value: 100, suffix: "%", label: t("openaiCompat") },
    { value: 100, suffix: "ms", prefix: "<", label: t("latency"), noAnim: true },
  ];

  return (
    <section className="gradient-brand py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="font-heading text-4xl font-bold text-white md:text-5xl">
                {s.noAnim ? (
                  <span>{s.prefix}{s.value}{s.suffix}</span>
                ) : (
                  <CountUp target={s.value} suffix={s.suffix} prefix={s.prefix} />
                )}
              </div>
              <div className="mt-2 text-sm font-medium text-white/70">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
