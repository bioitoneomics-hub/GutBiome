import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Analysis, ReportType } from "@/lib/microbiome/types";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";

const TYPE_LABEL: Record<ReportType, string> = {
  doctor: "Doctor-centric report",
  patient: "Patient-centric report",
  detailed: "Detailed scientific report",
};

export function ReportPage({
  analysis,
  type,
  page,
  total,
  children,
  className,
  contentClassName,
}: {
  analysis: Analysis;
  type: ReportType;
  page: number;
  total: number;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const { sample, lab } = analysis;
  return (
    <article
      className={cn(
        "report-page relative mx-auto flex flex-col bg-[#fbf8f1] text-[#1a2422] shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between border-b border-[#1f4f4a]/20 px-9 pt-6 pb-3">
        <div>
          <div className="mb-2.5 flex items-center gap-2.5">
            <Image
              src="/oneomics-logo.png"
              alt="OneOmics"
              width={140}
              height={33}
              className="h-7 w-auto object-contain"
            />
            <div className="border-l border-[#1f4f4a]/25 pl-2.5 flex items-center">
              <MyGutBiomeLogo variant="light" height={22} className="h-5.5 w-auto object-contain" priority={page <= 3} />
            </div>
          </div>
          <h1 className="font-serif text-xl leading-tight text-[#143834]">
            {TYPE_LABEL[type]}
          </h1>
          <p className="mt-0.5 text-[11px] text-[#4d5c59]">
            {sample.accession} · {sample.patientCode} · {sample.displayName}
          </p>
        </div>
        <div className="text-right text-[10px] text-[#4d5c59]">
          <p>{lab.site}</p>
          <p>Collected {sample.collectionDate}</p>
          <p>Reported {analysis.generatedAt.slice(0, 10)}</p>
        </div>
      </div>
      <div className={cn("flex-1 px-9 py-4", contentClassName)}>{children}</div>
      <footer className="mt-auto flex items-center justify-between border-t border-[#1f4f4a]/20 bg-[#f4f0e6]/70 px-9 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#9a7b3c] shrink-0" />
          <p className="text-[12px] font-bold tracking-wide text-[#143834]">
            Research interpretive report. Not a stand-alone diagnosis or prescription.
          </p>
        </div>
        <p className="font-mono text-[11px] font-bold text-[#4d5c59]">
          Page {page} of {total}
        </p>
      </footer>
    </article>
  );
}

export function LevelPill({
  level,
}: {
  level: "critical" | "high" | "moderate" | "low" | "info" | "elevated" | "borderline" | "typical";
}) {
  const map: Record<string, { cls: string; label: string }> = {
    critical: { cls: "bg-rose-50 text-rose-700 border border-rose-200 font-semibold", label: "Critical Priority" },
    high: { cls: "bg-amber-50 text-amber-700 border border-amber-200 font-semibold", label: "High Priority" },
    elevated: { cls: "bg-rose-50 text-rose-700 border border-rose-200 font-semibold", label: "Elevated · Needs Attention" },
    moderate: { cls: "bg-amber-50 text-amber-700 border border-amber-200 font-semibold", label: "Moderate" },
    borderline: { cls: "bg-amber-50 text-amber-700 border border-amber-200 font-semibold", label: "Borderline · Slightly Off" },
    low: { cls: "bg-[#1f4f4a]/8 text-[#143834] border border-[#1f4f4a]/15 font-semibold", label: "Low" },
    typical: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold", label: "Typical · Normal Baseline" },
    info: { cls: "bg-[#faf8f2] text-[#143834] border border-[#1f4f4a]/12", label: "Info" },
  };
  const item = map[level] ?? { cls: "bg-[#faf8f2] text-[#143834] border border-[#1f4f4a]/12", label: level };
  return (
    <span
      className={cn(
        "inline-block rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
        item.cls,
      )}
    >
      {item.label}
    </span>
  );
}

export function MiniBar({
  value,
  max = 100,
  warn,
  variant,
  trackBg,
  fillColor,
}: {
  value: number;
  max?: number;
  warn?: boolean;
  variant?: "rose" | "emerald" | "amber";
  trackBg?: string;
  fillColor?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillCls =
    fillColor
      ? fillColor
      : variant === "rose" || warn
      ? "bg-[#E5484D]"
      : variant === "emerald"
      ? "bg-emerald-500/80"
      : variant === "amber"
      ? "bg-amber-400"
      : "bg-emerald-500/80";

  const trackCls =
    trackBg
      ? trackBg
      : variant === "rose" || warn
      ? "bg-[#FDECEC]"
      : "bg-[#1f4f4a]/8";

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full", trackCls)}>
      <div
        className={cn("h-full rounded-full transition-all", fillCls)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
