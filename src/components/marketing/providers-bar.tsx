const providers = [
  { name: "OpenAI", color: "text-green-600" },
  { name: "Anthropic", color: "text-orange-600" },
  { name: "Google", color: "text-blue-600" },
  { name: "DeepSeek", color: "text-violet-600" },
];

export function ProvidersBar() {
  return (
    <section className="border-y bg-muted/20 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-center text-sm text-muted-foreground">
          支持的模型供应商
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {providers.map((p) => (
            <span
              key={p.name}
              className={`text-lg font-semibold ${p.color}`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
