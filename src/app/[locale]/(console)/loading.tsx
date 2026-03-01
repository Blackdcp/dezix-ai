export default function ConsoleLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page title skeleton */}
      <div className="h-8 w-48 rounded-lg bg-white/60" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-3 h-4 w-20 rounded bg-gray-100" />
            <div className="h-7 w-28 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 h-5 w-32 rounded bg-gray-100" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 flex-1 rounded bg-gray-50" />
              <div className="h-4 w-24 rounded bg-gray-50" />
              <div className="h-4 w-16 rounded bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
