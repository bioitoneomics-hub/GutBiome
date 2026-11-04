"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Sparkles,
  Stethoscope,
  BookOpen,
  Layers,
  ArrowRight,
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
  ShieldAlert,                                                                                                                                                                          
  Activity,
  Archive,
  RefreshCw,
  X,
  FileDown,
  ChevronDown,
} from "lucide-react";
import type { Analysis, SampleInput } from "@/lib/microbiome/types";
import type { ReportRecord } from "@/lib/store";

export interface SampleReportEntry {
  sample: SampleInput;
  analysis: Analysis;
  reports: ReportRecord[];
  doctorReport?: ReportRecord;
}

export function ReportsBatchManager({
  initialData,
}: {
  initialData: SampleReportEntry[];
}) {
  const [data, setData] = useState(initialData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<
    "all" | "signed" | "pending" | "amr" | "biom"
  >("all");
  const [isExporting, setIsExporting] = useState<string | null>(null); // e.g. 'doctor', 'patient', 'detailed', 'all', 'csv'
  const [isSigningOff, setIsSigningOff] = useState(false);
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [signOffDoctorName, setSignOffDoctorName] = useState(
    "Dr. Evelyn Reed, MD, FRCPath"
  );
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Compute filter tabs counts
  const counts = useMemo(() => {
    return {
      all: data.length,
      signed: data.filter((d) => d.doctorReport?.status === "signed_off").length,
      pending: data.filter((d) => d.doctorReport?.status !== "signed_off").length,
      amr: data.filter((d) =>
        d.analysis.amr.some((a) => a.level === "critical" || a.level === "high")
      ).length,
      biom: data.filter((d) => d.sample.source === "biom").length,
    };
  }, [data]);

  // Filter and search
  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      // Tab filter
      if (filterTab === "signed" && entry.doctorReport?.status !== "signed_off")
        return false;
      if (filterTab === "pending" && entry.doctorReport?.status === "signed_off")
        return false;
      if (
        filterTab === "amr" &&
        !entry.analysis.amr.some((a) => a.level === "critical" || a.level === "high")
      )
        return false;
      if (filterTab === "biom" && entry.sample.source !== "biom") return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const s = entry.sample;
      return (
        s.id.toLowerCase().includes(q) ||
        s.accession.toLowerCase().includes(q) ||
        (s.patientCode && s.patientCode.toLowerCase().includes(q)) ||
        (s.displayName && s.displayName.toLowerCase().includes(q)) ||
        (s.indication && s.indication.toLowerCase().includes(q)) ||
        (s.biomFileName && s.biomFileName.toLowerCase().includes(q))
      );
    });
  }, [data, filterTab, searchQuery]);

  // Selection handlers
  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((d) => selectedIds.includes(d.sample.id));

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((d) => d.sample.id));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Trigger Bulk PDF ZIP Download
  async function triggerBulkPdfExport(reportType: "doctor" | "patient" | "detailed" | "all") {
    const idsToExport = selectedIds.length ? selectedIds : filteredData.map((d) => d.sample.id);
    if (!idsToExport.length) return;

    setIsExporting(reportType);
    setExportMessage(
      `Compiling ${idsToExport.length} ${reportType.toUpperCase()} reports into high-resolution ZIP archive…`
    );

    try {
      const res = await fetch("/api/reports/batch/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleIds: idsToExport,
          reportType,
          includeCsv: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate batch reports ZIP.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MYGUTBIOME_BATCH_${reportType.toUpperCase()}_${idsToExport.length}SAMPLES.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      setExportMessage(`Successfully exported ${idsToExport.length} ${reportType} reports.`);
      setTimeout(() => setExportMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to download ZIP archive.");
      setExportMessage(null);
    } finally {
      setIsExporting(null);
    }
  }

  // Trigger Cohort CSV Download
  async function triggerCsvExport() {
    const idsToExport = selectedIds.length ? selectedIds : filteredData.map((d) => d.sample.id);
    setIsExporting("csv");

    try {
      const url = `/api/reports/batch/csv${
        idsToExport.length ? `?sampleIds=${idsToExport.join(",")}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to export CSV.");

      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `MYGUTBIOME_COHORT_SUMMARY_${idsToExport.length}SAMPLES.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(dlUrl);
      a.remove();
    } catch (err: any) {
      alert(err.message || "Failed to download cohort CSV.");
    } finally {
      setIsExporting(null);
    }
  }

  // Batch Sign-Off
  async function executeBatchSignOff() {
    if (!selectedIds.length) return;
    setIsSigningOff(true);

    try {
      const res = await fetch("/api/reports/batch/sign-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleIds: selectedIds,
          reportType: "doctor",
          signedOffBy: signOffDoctorName,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Batch sign-off failed.");

      // Update local state to reflect sign-off immediately
      setData((prev) =>
        prev.map((entry) => {
          if (selectedIds.includes(entry.sample.id)) {
            return {
              ...entry,
              doctorReport: {
                ...(entry.doctorReport || {
                  id: `rep-${entry.sample.id}-doctor`,
                  sampleId: entry.sample.id,
                  reportType: "doctor",
                  reportPayload: {},
                  createdAt: new Date().toISOString(),
                }),
                status: "signed_off",
                signedOffBy: signOffDoctorName,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return entry;
        })
      );

      setShowSignOffModal(false);
      setExportMessage(`Successfully signed off ${selectedIds.length} doctor reports!`);
      setTimeout(() => setExportMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to execute batch sign-off.");
    } finally {
      setIsSigningOff(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-[#1f4f4a]/15 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8885]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accessions, patient codes, indications, or matrix names…"
              className="h-10 w-full rounded-xl border border-[#1f4f4a]/20 bg-[#faf8f2]/60 pl-10 pr-9 text-xs text-[#143834] placeholder:text-[#8a9895] focus:border-[#1f4f4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4f4a]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Select / Deselect All */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#1f4f4a]/20 bg-[#faf8f2] px-3.5 text-xs font-semibold text-[#143834] hover:bg-white hover:border-[#1f4f4a]/50 transition-colors cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="h-4 w-4 text-[#1f4f4a]" />
              ) : (
                <Square className="h-4 w-4 text-[#7a8885]" />
              )}
              <span>{isAllSelected ? "Deselect All" : "Select All Visible"}</span>
            </button>

            {/* Direct CSV Export button */}
            <button
              type="button"
              onClick={triggerCsvExport}
              disabled={isExporting === "csv"}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#1f4f4a]/20 bg-white px-3.5 text-xs font-semibold text-[#143834] hover:border-[#1f4f4a]/50 hover:bg-[#faf8f2] transition-colors cursor-pointer disabled:opacity-50"
              title="Download cohort metadata CSV"
            >
              {isExporting === "csv" ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#1f4f4a]" />
              ) : (
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#1f4f4a]" />
              )}
              <span>Cohort CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#1f4f4a]/10 pt-3 text-xs">
          {[
            { id: "all", label: "All Accessions", count: counts.all },
            { id: "signed", label: "Signed Off", count: counts.signed },
            { id: "pending", label: "Pending Review", count: counts.pending },
            { id: "amr", label: "Critical AMR Alert", count: counts.amr },
            { id: "biom", label: "BIOM Ingestions", count: counts.biom },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#1f4f4a] text-white font-semibold shadow-2xs"
                    : "text-[#5c6b68] hover:bg-[#1f4f4a]/10 hover:text-[#143834]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-black/5 text-[#6a7875]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress / Status Toast Banner */}
      {exportMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-950 shadow-xs animate-in fade-in">
          <RefreshCw className="h-4 w-4 animate-spin text-emerald-700 shrink-0" />
          <span className="font-medium">{exportMessage}</span>
        </div>
      )}

      {/* Accessions List */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-[#1f4f4a]/15 bg-white p-12 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-[#143834]">
              No matching clinical accessions found
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Try adjusting your search criteria or filter tabs.
            </p>
          </div>
        ) : (
          filteredData.map(({ sample: s, analysis: a, reports, doctorReport }) => {
            const isSelected = selectedIds.includes(s.id);
            const isSignedOff = doctorReport?.status === "signed_off";
            const criticalAmrCount = a.amr.filter(
              (am) => am.level === "critical" || am.level === "high"
            ).length;

            return (
              <div
                key={s.id}
                className={`rounded-2xl border p-4.5 transition-all ${
                  isSelected
                    ? "border-[#1f4f4a] bg-[#1f4f4a]/4 ring-2 ring-[#1f4f4a]/25 shadow-xs"
                    : "border-[#1f4f4a]/18 bg-white hover:border-[#1f4f4a]/50 hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(s.id)}
                      className="mt-0.5 shrink-0 text-[#1f4f4a] hover:opacity-80 transition cursor-pointer"
                      title={isSelected ? "Deselect" : "Select for batch action"}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 fill-[#1f4f4a]/10" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-300 hover:text-gray-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#143834] bg-[#1f4f4a]/8 px-2 py-0.5 rounded">
                          {s.id.toUpperCase()}
                        </span>
                        {s.patientCode && (
                          <span className="font-mono text-xs text-[#5c6b68]">
                            {s.patientCode}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-[#143834] truncate">
                          {s.displayName || "Patient Accession"}
                        </span>
                        <span className="text-xs text-[#7a8885]">
                          ({s.age}y · {s.sex})
                        </span>
                        {isSignedOff ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Doctor Report Signed Off
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            <Clock className="h-3 w-3" />
                            Pending Review
                          </span>
                        )}
                        {s.source === "biom" && (
                          <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                            BIOM {s.biomSampleId || "Import"}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-[#4d5c59] truncate">
                        <span className="font-semibold text-[#143834]">Indication:</span>{" "}
                        {s.indication || "Standard clinical metagenomic screening"}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-[#5c6b68]">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-[#143834]">Gut Score:</span>{" "}
                          <span className="font-mono font-bold text-[#143834]">
                            {a.gutScore}/100
                          </span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-[#143834]">AMR:</span>{" "}
                          <span
                            className={`font-bold ${
                              criticalAmrCount > 0 ? "text-rose-700" : "text-emerald-700"
                            }`}
                          >
                            {criticalAmrCount} critical/high
                          </span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-[#143834]">F/B:</span>{" "}
                          <span className="font-mono font-bold text-[#143834]">
                            {a.diversity.firmicutesBacteroidota ? a.diversity.firmicutesBacteroidota.toFixed(2) : "N/A"}
                          </span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-[#143834]">Shannon:</span>{" "}
                          <span className="font-mono font-bold text-[#143834]">
                            {a.diversity.shannon.toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Individual Report Quick-Action Links */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pl-8 lg:pl-0">
                    <Link
                      href={`/reports/${s.id}/doctor`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#1f4f4a]/20 bg-[#faf8f2] px-2.5 text-[11px] font-semibold text-[#143834] hover:bg-white hover:border-[#1f4f4a]/50 transition-colors"
                      title="Open Doctor Brief"
                    >
                      <Stethoscope className="h-3 w-3 text-[#1f4f4a]" />
                      <span>Doctor (3p)</span>
                    </Link>

                    <Link
                      href={`/reports/${s.id}/patient`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#1f4f4a]/20 bg-[#faf8f2] px-2.5 text-[11px] font-semibold text-[#143834] hover:bg-white hover:border-[#1f4f4a]/50 transition-colors"
                      title="Open Patient Booklet"
                    >
                      <BookOpen className="h-3 w-3 text-[#1f4f4a]" />
                      <span>Patient (5p)</span>
                    </Link>

                    <Link
                      href={`/reports/${s.id}/detailed`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#1f4f4a]/20 bg-[#faf8f2] px-2.5 text-[11px] font-semibold text-[#143834] hover:bg-white hover:border-[#1f4f4a]/50 transition-colors"
                      title="Open Detailed Scientific Report"
                    >
                      <Layers className="h-3 w-3 text-[#1f4f4a]" />
                      <span>Detailed (30p)</span>
                    </Link>

                    <a
                      href={`/api/reports/${s.id}/pdf?type=doctor`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
                      title="Download Doctor PDF directly"
                    >
                      <FileDown className="h-3.5 w-3.5 text-emerald-700" />
                      <span>PDF</span>
                    </a>

                    <Link
                      href={`/reports/${s.id}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1f4f4a] px-3 text-[11px] font-semibold text-white hover:bg-[#143834] transition-colors"
                      title="Open Clinical Report Hub"
                    >
                      <span>Hub</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* STICKY BULK ACTION BAR (Floats when 1 or more items are selected)          */}
      {/* ========================================================================= */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1f4f4a]/30 bg-[#102b28]/95 px-5 py-3.5 text-white shadow-2xl backdrop-blur-md">
            {/* Selection Status */}
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                {selectedIds.length}
              </span>
              <div>
                <p className="text-xs font-bold leading-tight">
                  {selectedIds.length} accessions selected
                </p>
                <p className="text-[10px] text-white/60">
                  {selectedIds.length * 3} clinical reports ready for batch export
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-white/60 hover:text-white underline ml-1 cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Export ZIP Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  disabled={isExporting !== null}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-bold text-[#143834] shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isExporting && isExporting !== "csv" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#143834]" />
                  ) : (
                    <Archive className="h-3.5 w-3.5 text-[#143834]" />
                  )}
                  <span>Export Bulk ZIP</span>
                  <ChevronDown className="h-3 w-3 ml-0.5 opacity-70" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex group-focus-within:flex flex-col min-w-[240px] rounded-xl border border-[#1f4f4a]/20 bg-white p-1.5 shadow-xl text-left text-xs z-50">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7a8885] border-b border-gray-100">
                    Select Report Tier Archive:
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerBulkPdfExport("doctor")}
                    className="flex items-center justify-between px-2.5 py-2 text-left text-[#143834] hover:bg-[#1f4f4a]/8 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold block">Doctor Briefs (.zip)</span>
                      <span className="text-[10px] text-gray-500">
                        {selectedIds.length} PDFs (3-page briefs + CSV)
                      </span>
                    </div>
                    <FileDown className="h-4 w-4 text-[#1f4f4a]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerBulkPdfExport("patient")}
                    className="flex items-center justify-between px-2.5 py-2 text-left text-[#143834] hover:bg-[#1f4f4a]/8 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold block">Patient Booklets (.zip)</span>
                      <span className="text-[10px] text-gray-500">
                        {selectedIds.length} PDFs (5-page guides + CSV)
                      </span>
                    </div>
                    <FileDown className="h-4 w-4 text-[#1f4f4a]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerBulkPdfExport("detailed")}
                    className="flex items-center justify-between px-2.5 py-2 text-left text-[#143834] hover:bg-[#1f4f4a]/8 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold block">Detailed Reports (.zip)</span>
                      <span className="text-[10px] text-gray-500">
                        {selectedIds.length} PDFs (30-page reports + CSV)
                      </span>
                    </div>
                    <FileDown className="h-4 w-4 text-[#1f4f4a]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerBulkPdfExport("all")}
                    className="flex items-center justify-between px-2.5 py-2 text-left text-[#143834] hover:bg-[#1f4f4a]/8 rounded-lg cursor-pointer transition-colors border-t border-gray-100 mt-1 pt-1.5"
                  >
                    <div>
                      <span className="font-bold block text-emerald-800">
                        Consolidated Merged Suites (.zip)
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {selectedIds.length} complete 38-page report suites
                      </span>
                    </div>
                    <FileDown className="h-4 w-4 text-emerald-700" />
                  </button>
                </div>
              </div>

              {/* Cohort CSV Button */}
              <button
                type="button"
                onClick={triggerCsvExport}
                disabled={isExporting === "csv"}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isExporting === "csv" ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                )}
                <span>Export CSV</span>
              </button>

              {/* Batch Sign-off Button */}
              <button
                type="button"
                onClick={() => setShowSignOffModal(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Sign-Off ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH SIGN-OFF CONFIRMATION MODAL                                         */}
      {/* ========================================================================= */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-[#1f4f4a]/20 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                  Clinical Governance &amp; LIMS Sign-Off
                </span>
                <h3 className="font-serif text-lg font-bold text-[#143834]">
                  Batch Sign-Off {selectedIds.length} Doctor Reports
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSignOffModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#5c6b68] leading-relaxed">
              You are about to certify and sign off {selectedIds.length} clinical doctor-centric
              reports. This writes a digital signature and timestamp directly into the
              Biomine_DB MySQL database.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#143834] block">
                Attending Physician / Pathologist Signature:
              </label>
              <input
                type="text"
                value={signOffDoctorName}
                onChange={(e) => setSignOffDoctorName(e.target.value)}
                className="h-9 w-full rounded-xl border border-[#1f4f4a]/20 px-3 text-xs text-[#143834] focus:border-[#1f4f4a] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowSignOffModal(false)}
                className="h-9 rounded-xl border border-gray-200 px-4 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBatchSignOff}
                disabled={isSigningOff || !signOffDoctorName.trim()}
                className="h-9 rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
              >
                {isSigningOff && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm &amp; Sign-Off All {selectedIds.length}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
