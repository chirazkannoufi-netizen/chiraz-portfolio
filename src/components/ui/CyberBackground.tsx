const EDGES: ReadonlyArray<[number, number, number, number]> = [
  [120, 180, 340, 90],
  [340, 90, 560, 220],
  [560, 220, 800, 140],
  [800, 140, 920, 340],
  [560, 220, 500, 420],
  [500, 420, 260, 380],
  [260, 380, 140, 560],
  [500, 420, 760, 480],
  [760, 480, 920, 340],
  [260, 380, 380, 650],
  [380, 650, 620, 700],
  [620, 700, 860, 640],
  [760, 480, 860, 640],
  [380, 650, 180, 820],
  [620, 700, 480, 850],
];

const NODES: ReadonlyArray<[number, number, number]> = [
  [120, 180, 0],
  [340, 90, 0.4],
  [560, 220, 0.8],
  [800, 140, 1.2],
  [920, 340, 1.6],
  [760, 480, 0.2],
  [500, 420, 0.6],
  [260, 380, 1],
  [140, 560, 1.4],
  [380, 650, 1.8],
  [620, 700, 0.3],
  [860, 640, 0.7],
  [480, 850, 1.1],
  [180, 820, 1.5],
];

/**
 * Fixed, site-wide ambient backdrop: a receding perspective circuit grid
 * plus a drifting node network, evoking AI/automation without a canvas or
 * WebGL scene. A Server Component — it's static markup, so there's no
 * hydration cost for something that just sits behind everything.
 */
export function CyberBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="cyber-grid" />

      <div className="absolute -top-32 start-1/4 size-[32rem] rounded-full bg-[var(--glow)] opacity-70 blur-3xl" />
      <div className="absolute top-1/2 end-0 size-[28rem] translate-x-1/3 rounded-full bg-[var(--glow)] opacity-50 blur-3xl rtl:-translate-x-1/3" />

      <svg
        className="absolute inset-0 size-full opacity-70"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {EDGES.map(([x1, y1, x2, y2], i) => (
          <line key={i} className="cyber-line" x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
        {NODES.map(([cx, cy, delay], i) => (
          <circle key={i} className="cyber-node" cx={cx} cy={cy} r="4" style={{ animationDelay: `${delay}s` }} />
        ))}
      </svg>
    </div>
  );
}
