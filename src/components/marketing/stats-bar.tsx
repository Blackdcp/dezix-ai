const stats = [
  { value: "7+", label: "AI 模型" },
  { value: "4", label: "模型供应商" },
  { value: "100%", label: "OpenAI 兼容" },
  { value: "<100ms", label: "额外延迟" },
];

export function StatsBar() {
  return (
    <section className="border-y bg-primary py-12 text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold md:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
