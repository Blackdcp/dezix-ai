"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 7, suffix: "+", label: "AI 模型" },
  { value: 4, suffix: "", label: "模型供应商" },
  { value: 100, suffix: "%", label: "OpenAI 兼容" },
  { value: 100, suffix: "ms", prefix: "<", label: "额外延迟" },
];

function CountUp({
  target,
  suffix,
  prefix,
}: {
  target: number;
  suffix: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    <div ref={ref} className="text-3xl font-bold text-[#1d1d1f] md:text-4xl">
      {prefix}
      {count}
      {suffix}
    </div>
  );
}

export function StatsBar() {
  return (
    <section className="bg-[#f5f5f7] py-16">
      <div className="mx-auto max-w-6xl px-4">
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
              <CountUp
                target={s.value}
                suffix={s.suffix}
                prefix={s.prefix}
              />
              <div className="mt-1 text-sm text-[#86868b]">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
