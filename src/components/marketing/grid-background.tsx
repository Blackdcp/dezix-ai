export function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Dot grid */}
      <div className="dot-grid absolute inset-0 opacity-40" />
      {/* Gradient fade at edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fb] via-transparent to-[#f8f9fb]" />
      {/* Glow orbs */}
      <div className="glow-orb left-1/4 top-1/4 h-96 w-96 bg-[#2563eb]" />
      <div className="glow-orb right-1/4 bottom-1/4 h-80 w-80 bg-[#7c3aed]" />
    </div>
  );
}
