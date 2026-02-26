export function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Dot grid */}
      <div className="dot-grid absolute inset-0 opacity-40" />
      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
      {/* Decorative blobs */}
      <div className="shape-blob left-[10%] top-[15%] h-[400px] w-[400px] bg-[#6366F1]" />
      <div className="shape-blob right-[10%] top-[30%] h-[350px] w-[350px] bg-[#E87B6A]" />
      <div className="shape-blob left-[40%] bottom-[10%] h-[300px] w-[300px] bg-[#059669]" />
    </div>
  );
}
