"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Dna,
  ArrowRight,
  FileText,
  User,
  Activity,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import type { Analysis, SampleInput } from "@/lib/microbiome/types";
import { PROFILE_LABELS } from "@/lib/microbiome/samples";

interface SampleItem {
  s: SampleInput;
  a: Analysis;
}

interface SampleExplorerProps {
  items: SampleItem[];
}

export function SampleExplorer({ items: initialItems }: SampleExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<SampleItem[]>(initialItems);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "amr" | "biom" | "elevated" | "healthy">("all");
  const [sortBy, setSortBy] = useState<"newest" | "score-desc" | "score-asc">("newest");

  // Deletion state
  const [sampleToDelete, setSampleToDelete] = useState<SampleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync state if initialItems changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Sync with ?filter=... in URL (e.g. from LIMS sidebar clicks)
  useEffect(() => {
    const qFilter = searchParams.get("filter");
    if (qFilter && ["all", "amr", "biom", "elevated", "healthy"].includes(qFilter)) {
      setFilter(qFilter as "all" | "amr" | "biom" | "elevated" | "healthy");
    }
  }, [searchParams]);

  // Filter counts
  const counts = useMemo(() => {
    return {
      all: items.length,
      amr: items.filter((it) => it.a.amr.some((x) => x.level === "critical" || x.level === "high")).length,
      biom: items.filter((it) => it.s.source === "biom").length,
      elevated: items.filter((it) => it.a.diseases.some((d) => d.band === "elevated")).length,
      healthy: items.filter((it) => it.a.gutScore >= 75 || it.s.profileId === "healthy").length,
    };
  }, [items]);

  // Filtered & Sorted items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items
      .filter(({ s, a }) => {
        // Query match
        const matchesQuery =
          !q ||
          s.accession.toLowerCase().includes(q) ||
          s.patientCode.toLowerCase().includes(q) ||
          s.displayName.toLowerCase().includes(q) ||
          s.indication.toLowerCase().includes(q) ||
          (s.biomFileName && s.biomFileName.toLowerCase().includes(q));

        if (!matchesQuery) return false;

        // Filter match
        if (filter === "amr") {
          return a.amr.some((x) => x.level === "critical" || x.level === "high");
        }
        if (filter === "biom") {
          return s.source === "biom";
        }
        if (filter === "elevated") {
          return a.diseases.some((d) => d.band === "elevated");
        }
        if (filter === "healthy") {
          return a.gutScore >= 75 || s.profileId === "healthy";
        }
        return true;
      })
      .sort((itemA, itemB) => {
        if (sortBy === "score-desc") return itemB.a.gutScore - itemA.a.gutScore;
        if (sortBy === "score-asc") return itemA.a.gutScore - itemB.a.gutScore;
        return itemB.s.createdAt.localeCompare(itemA.s.createdAt);
      });
  }, [items, query, filter, sortBy]);

  async function handleDeleteConfirm() {
    if (!sampleToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/samples/${sampleToDelete.s.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete sample.");
      }

      // Remove from local state immediately
      setItems((prev) => prev.filter((it) => it.s.id !== sampleToDelete.s.id));
      setSampleToDelete(null);
      router.refresh();
    } catch (err: any) {
      console.error("Delete sample error:", err);
      setDeleteError(err.message || "An unexpected error occurred while deleting the sample.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mt-8 space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1f4f4a]/15 bg-white/80 p-3.5 backdrop-blur-md shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8885]" />
          <input
            type="text"
            placeholder="Search accessions, patient codes, indications, or BIOM matrices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[#1f4f4a]/20 bg-[#fbf8f1]/60 py-2 pl-9.5 pr-4 text-xs text-[#143834] placeholder:text-[#8a9895] focus:border-[#1f4f4a] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1f4f4a]"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#1f4f4a]/6 p-1 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                filter === "all"
                  ? "bg-white text-[#143834] shadow-xs font-semibold"
                  : "text-[#5a6865] hover:text-[#143834]"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter("amr")}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-all ${
                filter === "amr"
                  ? "bg-rose-100 text-rose-900 shadow-xs font-semibold"
                  : "text-[#5a6865] hover:text-[#143834]"
              }`}
            >
              <ShieldAlert className="h-3 w-3 text-rose-600" />
              <span>AMR ({counts.amr})</span>
            </button>
            <button
              onClick={() => setFilter("elevated")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                filter === "elevated"
                  ? "bg-amber-100 text-amber-900 shadow-xs font-semibold"
                  : "text-[#5a6865] hover:text-[#143834]"
              }`}
            >
              Elevated ({counts.elevated})
            </button>
            <button
              onClick={() => setFilter("biom")}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-all ${
                filter === "biom"
                  ? "bg-blue-100 text-blue-900 shadow-xs font-semibold"
                  : "text-[#5a6865] hover:text-[#143834]"
              }`}
            >
              <Dna className="h-3 w-3 text-blue-600" />
              <span>BIOM ({counts.biom})</span>
            </button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-8 rounded-xl border border-[#1f4f4a]/20 bg-white px-2.5 text-xs text-[#143834] focus:border-[#1f4f4a] focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="score-desc">Highest Gut Score</option>
            <option value="score-asc">Lowest Gut Score</option>
          </select>
        </div>
      </div>

      {/* Accession Cards Grid */}
      <div className="grid gap-3.5">
        {filtered.map(({ s, a }) => {
          const criticalAmr = a.amr.filter((it) => it.level === "critical" || it.level === "high");
          const topElevatedDisease = a.diseases.find((d) => d.band === "elevated");
          const scoreColor =
            a.gutScore >= 75
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : a.gutScore >= 45
              ? "text-amber-700 bg-amber-50 border-amber-200"
              : "text-rose-700 bg-rose-50 border-rose-200";

          return (
            <article
              key={s.id}
              className="group relative rounded-2xl border border-[#1f4f4a]/15 bg-white/90 p-5 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-[#1f4f4a]/40 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Left section: Identity & Demographics */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold tracking-wide text-[#143834]">
                      {s.accession}
                    </span>
                    <span className="text-[#8a9895]">·</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#1f4f4a]/8 px-2 py-0.5 font-medium text-[#1f4f4a]">
                      <User className="h-3 w-3" />
                      {s.patientCode}
                    </span>
                    <span className="text-[#8a9895]">·</span>
                    <span className="text-[#5a6865]">
                      {s.age}y · {s.sex.charAt(0).toUpperCase() + s.sex.slice(1)}
                    </span>
                    {s.source === "biom" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200/60">
                        <Dna className="h-3 w-3" />
                        BIOM: {s.biomFileName || s.biomSampleId} ({s.biomFeatureCount ?? 0} features)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 border border-teal-200/60">
                        {PROFILE_LABELS[s.profileId]?.title || "Clinical Profile"}
                      </span>
                    )}
                  </div>

                  {/* Title & Indication */}
                  <div>
                    <h3 className="font-serif text-2xl font-normal text-[#143834] group-hover:text-[#1f4f4a] transition-colors">
                      {s.displayName}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#4d5c59] leading-relaxed">
                      {s.indication}
                    </p>
                  </div>

                  {/* Clinical Highlights Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {/* Gut Score Pill */}
                    <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-semibold ${scoreColor}`}>
                      <Activity className="h-3.5 w-3.5" />
                      <span>Gut Score {a.gutScore}/100</span>
                    </div>

                    {/* Shannon Diversity */}
                    <div className="inline-flex items-center gap-1 rounded-lg border border-[#1f4f4a]/12 bg-[#1f4f4a]/5 px-2.5 py-1 text-[#3d4c49]">
                      <span className="text-[#6a7875]">Shannon H&apos;:</span>
                      <span className="font-semibold text-[#143834]">{a.diversity.shannon}</span>
                    </div>

                    {/* AMR Alert Badge */}
                    {criticalAmr.length > 0 ? (
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 font-medium text-rose-800">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                        <span>
                          {criticalAmr.length} high-priority AMR call{criticalAmr.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2 py-1 text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>No critical AMR</span>
                      </div>
                    )}

                    {/* Top Elevated Disease Pattern */}
                    {topElevatedDisease && (
                      <div className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
                        <span>{topElevatedDisease.name} ({Math.round(topElevatedDisease.score)})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right section: Action Buttons + Delete Action */}
                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center lg:flex-col lg:items-end lg:pt-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/reports/${s.id}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#143834] px-4 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#1f4f4a] hover:shadow"
                    >
                      <span>View Report Hub</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {/* Delete Trigger Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setSampleToDelete({ s, a });
                      }}
                      title={`Delete sample ${s.accession}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 hover:text-rose-900 transition-colors shadow-2xs"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <Link
                      href={`/reports/${s.id}/doctor`}
                      className="rounded-lg border border-[#1f4f4a]/15 bg-white px-2.5 py-1 font-medium text-[#1f4f4a] transition hover:bg-[#1f4f4a]/5 hover:border-[#1f4f4a]/30"
                    >
                      Doctor
                    </Link>
                    <Link
                      href={`/reports/${s.id}/patient`}
                      className="rounded-lg border border-[#1f4f4a]/15 bg-white px-2.5 py-1 font-medium text-[#1f4f4a] transition hover:bg-[#1f4f4a]/5 hover:border-[#1f4f4a]/30"
                    >
                      Patient
                    </Link>
                    <Link
                      href={`/reports/${s.id}/detailed`}
                      className="rounded-lg border border-[#1f4f4a]/15 bg-white px-2.5 py-1 font-medium text-[#1f4f4a] transition hover:bg-[#1f4f4a]/5 hover:border-[#1f4f4a]/30"
                    >
                      Detailed
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#1f4f4a]/20 bg-white/60 p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-[#8a9895]" />
            <h4 className="mt-2 font-serif text-lg text-[#143834]">No samples found</h4>
            <p className="mt-1 text-xs text-[#6a7875]">
              No accessioned samples match your search &ldquo;{query}&rdquo; or selected filter.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="mt-3 inline-flex h-8 items-center rounded-lg bg-[#143834] px-3 text-xs font-medium text-white hover:bg-[#1f4f4a]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {sampleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#143834]">
                    Delete Sample Accession
                  </h3>
                  <p className="text-xs text-[#5c6b68]">
                    Permanent LIMS Record Removal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSampleToDelete(null)}
                className="rounded-lg p-1 text-[#7a8885] hover:bg-gray-100 hover:text-[#143834]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#fbf8f1] p-3 text-xs text-[#3d4c49] space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#143834]">Accession ID:</span>
                  <span className="font-mono font-bold text-[#143834]">{sampleToDelete.s.accession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#143834]">Patient Code:</span>
                  <span className="font-mono">{sampleToDelete.s.patientCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#143834]">Sample Name:</span>
                  <span className="text-[#143834] font-medium">{sampleToDelete.s.displayName}</span>
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 leading-relaxed">
                <p className="font-bold text-rose-950">⚠️ Warning: This action is permanent and cannot be undone.</p>
                <p className="mt-1 text-[11px] text-rose-800">
                  Deleting this sample will permanently purge the metagenomic matrix data, QC metrics, and all 3 generated reports (Doctor, Patient, and Detailed) from the MySQL database.
                </p>
              </div>

              {deleteError && (
                <div className="rounded-xl border border-rose-300 bg-rose-100 p-3 text-xs font-semibold text-rose-900">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-[#1f4f4a]/15">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSampleToDelete(null)}
                className="rounded-xl border border-[#1f4f4a]/20 bg-white px-4 py-2 text-xs font-semibold text-[#143834] hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting Accession...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
