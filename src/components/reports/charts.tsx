export function PhylumBars({
  data,
}: {
  data: { taxon: string; relativeAbundance: number }[];
}) {
  const top = data.slice(0, 7);
  const max = Math.max(...top.map((d) => d.relativeAbundance), 1);
  return (
    <div className="space-y-1.5">
      {top.map((d) => (
        <div key={d.taxon} className="grid grid-cols-[9.5rem_1fr_2.4rem] items-center gap-2 text-[10px]">
          <span className="truncate text-[#243330]">{d.taxon}</span>
          <div className="h-2 overflow-hidden rounded-full bg-[#e6e0d4]">
            <div
              className="h-full rounded-full bg-[#1f4f4a]"
              style={{ width: `${(d.relativeAbundance / max) * 100}%` }}
            />
          </div>
          <span className="text-right tabular-nums">{d.relativeAbundance.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, value) / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden>
        <circle cx="38" cy="38" r={r} fill="none" stroke="#e6e0d4" strokeWidth="8" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="#1f4f4a"
          strokeWidth="8"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
        />
        <text
          x="38"
          y="42"
          textAnchor="middle"
          className="fill-[#143834]"
          fontSize="13"
          fontWeight="700"
        >
          {value}
        </text>
      </svg>
      <p className="text-[11px] leading-snug text-[#3d4c49]">{label}</p>
    </div>
  );
}
