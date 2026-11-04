"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BiomTablePreview } from "@/lib/microbiome/types";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileText,
  Layers,
  ArrowRight,
  Info,
  ShieldCheck,
  X,
  Activity,
  AlertTriangle,
  Dna,
  Binary,
  Microscope,
  ShieldAlert,
  Check,
  Zap,
  Archive,
  FileDown,
  CheckSquare,
  Square,
  Users,
} from "lucide-react";

export function BiomUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BiomTablePreview | null>(null);
  const [biomSampleId, setBiomSampleId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"preview" | "process" | null>(null);
  const [processingStage, setProcessingStage] = useState(1);
  const [drag, setDrag] = useState(false);

  // Form metadata states
  const [displayName, setDisplayName] = useState("");
  const [patientCode, setPatientCode] = useState("");
  const [age, setAge] = useState(42);
  const [sex, setSex] = useState<"female" | "male" | "unspecified">("unspecified");
  const [indication, setIndication] = useState("");
  const [dietPattern, setDietPattern] = useState("");
  const [recentAntibiotics, setRecentAntibiotics] = useState(false);

  // Batch Ingestion States
  const [ingestMode, setIngestMode] = useState<"single" | "batch">("single");
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchIndication, setBatchIndication] = useState("High-Throughput Cohort Screening");
  const [batchResult, setBatchResult] = useState<any | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState<string | null>(null);

  const activeTaxaPreview = preview?.sampleTaxaPreviews?.[biomSampleId];

  async function previewFile(next: File) {
    setError(null);
    setPreview(null);
    setFile(next);
    setPending("preview");
    try {
      const body = new FormData();
      body.append("file", next);
      const res = await fetch("/api/biom/preview", { method: "POST", body });
      const json = await res.json();
      setPending(null);
      if (!res.ok) {
        setError(json.error ?? "Could not read this file.");
        setFile(null);
        return;
      }
      setPreview(json.preview);
      setBatchSelectedIds(json.preview.sampleIds);
      setBatchResult(null);
      const firstId = json.preview.sampleIds[0] ?? "";
      selectSample(firstId, json.preview);
    } catch {
      setPending(null);
      setError("Network or server error while parsing file.");
      setFile(null);
    }
  }

  function selectSample(id: string, prevObj?: BiomTablePreview) {
    const p = prevObj ?? preview;
    setBiomSampleId(id);

    // Contextual auto-fill based on sample ID clues
    const lower = id.toLowerCase();
    if (lower.includes("ibd")) {
      if (!displayName || displayName.includes("Wellness")) setDisplayName("Adult, IBD Cohort Profile");
      if (!patientCode) setPatientCode(`ONC-${id.slice(0, 6).toUpperCase()}`);
      if (!indication) setIndication("Dysbiosis evaluation in suspected inflammatory bowel disease flare.");
      if (!dietPattern) setDietPattern("Low residue, refined carbohydrates, low dairy.");
    } else if (lower.includes("wellness")) {
      if (!displayName || displayName.includes("IBD")) setDisplayName("Adult, Preventive Wellness Check");
      if (!patientCode) setPatientCode(`ONC-${id.slice(0, 6).toUpperCase()}`);
      if (!indication) setIndication("Routine microbiome wellness and longevity baseline assessment.");
      if (!dietPattern) setDietPattern("Mediterranean diet rich in whole grains and legumes.");
    } else {
      if (!displayName) setDisplayName(`Sample ${id} (Microbiome Ingestion)`);
      if (!patientCode) setPatientCode(`ONC-${id.slice(0, 6).toUpperCase()}`);
    }
  }

  async function loadExample(type: "biom" | "hdf5" | "fastq") {
    setError(null);
    setPending("preview");
    const targets = {
      biom: { url: "/examples/example-gut.biom", name: "example-gut.biom", type: "application/json" },
      hdf5: { url: "/examples/example-gut.h5", name: "example-gut.h5", type: "application/x-hdf5" },
      fastq: { url: "/examples/example-gut.fastq.gz", name: "example-gut.fastq.gz", type: "application/gzip" },
    };
    const target = targets[type];
    try {
      const res = await fetch(target.url);
      if (!res.ok) throw new Error("Could not fetch example file");
      const blob = await res.blob();
      const exampleFile = new File([blob], target.name, {
        type: target.type,
      });
      void previewFile(exampleFile);
    } catch {
      setPending(null);
      setError(`Failed to load example ${type.toUpperCase()} file.`);
    }
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    setBiomSampleId("");
    setBatchSelectedIds([]);
    setBatchResult(null);
    setIngestMode("single");
    setError(null);
  }

  async function onProcess(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose or drop a BIOM file first.");
      return;
    }
    if (!biomSampleId) {
      setError("Please select a sample column from the table preview.");
      return;
    }
    setPending("process");
    setProcessingStage(1);
    setError(null);

    const stageTimer = setInterval(() => {
      setProcessingStage((s) => (s < 4 ? s + 1 : 4));
    }, 600);

    const body = new FormData();
    body.append("file", file);
    body.append("biomSampleId", biomSampleId);
    body.append("displayName", displayName);
    body.append("patientCode", patientCode);
    body.append("age", String(age));
    body.append("sex", sex);
    body.append("indication", indication);
    body.append("dietPattern", dietPattern);
    if (recentAntibiotics) body.append("recentAntibiotics", "true");

    try {
      const res = await fetch("/api/biom/process", { method: "POST", body });
      const json = await res.json();
      clearInterval(stageTimer);
      if (!res.ok) {
        setPending(null);
        setError(json.error ?? "Processing failed.");
        return;
      }
      setProcessingStage(4);
      setTimeout(() => {
        router.push(json.reports.hub);
        router.refresh();
      }, 500);
    } catch {
      clearInterval(stageTimer);
      setPending(null);
      setError("Server error while analyzing microbiome dataset.");
    }
  }

  async function onBatchProcess(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose or drop a BIOM file first.");
      return;
    }
    if (!batchSelectedIds.length) {
      setError("Please select at least one sample from the cohort.");
      return;
    }
    setPending("process");
    setProcessingStage(1);
    setError(null);

    const stageTimer = setInterval(() => {
      setProcessingStage((s) => (s < 4 ? s + 1 : 4));
    }, 700);

    const body = new FormData();
    body.append("file", file);
    body.append("sampleIds", JSON.stringify(batchSelectedIds));
    body.append("indication", batchIndication || "High-Throughput Cohort Metagenomic Screening");
    body.append("dietPattern", dietPattern || "Not specified");
    if (recentAntibiotics) body.append("recentAntibiotics", "true");
    body.append("age", String(age));
    body.append("sex", sex);

    try {
      const res = await fetch("/api/biom/batch-process", { method: "POST", body });
      const json = await res.json();
      clearInterval(stageTimer);
      if (!res.ok) {
        setPending(null);
        setError(json.error ?? "Batch processing failed.");
        return;
      }
      setProcessingStage(4);
      setBatchResult(json);
      setPending(null);
    } catch {
      clearInterval(stageTimer);
      setPending(null);
      setError("Server error while executing batch processing.");
    }
  }

  async function downloadBatchExport(type: "doctor" | "patient" | "detailed" | "all") {
    if (!batchResult?.samples?.length) return;
    setIsBatchDownloading(type);
    try {
      const sids = batchResult.samples.map((s: any) => s.sample.id);
      const res = await fetch("/api/reports/batch/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleIds: sids,
          reportType: type,
          includeCsv: true,
        }),
      });
      if (!res.ok) throw new Error("Batch export failed.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MYGUTBIOME_BATCH_${type.toUpperCase()}_${sids.length}SAMPLES.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert(err.message || "Failed to download ZIP archive.");
    } finally {
      setIsBatchDownloading(null);
    }
  }

  async function downloadBatchCsv() {
    if (!batchResult?.samples?.length) return;
    setIsBatchDownloading("csv");
    try {
      const sids = batchResult.samples.map((s: any) => s.sample.id);
      const res = await fetch(`/api/reports/batch/csv?sampleIds=${sids.join(",")}`);
      if (!res.ok) throw new Error("CSV export failed.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MYGUTBIOME_COHORT_SUMMARY_${sids.length}SAMPLES.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert(err.message || "Failed to download cohort CSV.");
    } finally {
      setIsBatchDownloading(null);
    }
  }

  const indicationPresets = [
    { label: "IBD Workup", text: "Suspected inflammatory bowel disease; rule out active mucosal inflammation." },
    { label: "Metabolic Screen", text: "Insulin resistance & NAFLD metabolic evaluation." },
    { label: "Post-Antibiotic", text: "Post-antibiotic gut recovery and resistome screening." },
    { label: "IBS / Bloating", text: "Functional gastrointestinal symptoms, abdominal discomfort & bloating." },
    { label: "Routine Wellness", text: "Preventive baseline microbiome diversity and longevity assessment." },
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. MODERN DRAG-AND-DROP DROPZONE                                          */}
      {/* ========================================================================= */}
      {!file ? (
        <div
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            drag
              ? "border-[#1f4f4a] bg-[#1f4f4a]/10 ring-4 ring-[#1f4f4a]/15 scale-[1.01]"
              : "border-[#1f4f4a]/30 bg-white/80 hover:border-[#1f4f4a]/60 hover:bg-white"
          } shadow-sm`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const next = e.dataTransfer.files[0];
            if (next) void previewFile(next);
          }}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f4f4a]/10 text-[#1f4f4a]">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h2 className="mt-4 font-serif text-2xl font-bold text-[#143834]">
            Drag &amp; Drop your BIOM / FASTQ Dataset
          </h2>
          <p className="mx-auto mt-1.5 max-w-xl text-sm text-[#4d5c59] leading-relaxed">
            Upload dense or sparse microbiome profiles in standard <strong>BIOM 1.0 (JSON)</strong>, <strong>BIOM 2.1 (HDF5 Binary)</strong>, <strong>FASTQ / FASTQ.gz NGS reads</strong>, or classic QIIME2/Mothur OTU TSV.
          </p>

          {/* Format Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-md border border-[#1f4f4a]/20 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1f4f4a]">
              .biom (JSON 1.0)
            </span>
            <span className="rounded-md border border-[#1f4f4a]/20 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1f4f4a]">
              .biom / .h5 (HDF5 2.1)
            </span>
            <span className="rounded-md border border-[#1f4f4a]/20 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1f4f4a]">
              .fastq / .fastq.gz
            </span>
            <span className="rounded-md border border-[#1f4f4a]/20 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1f4f4a]">
              .tsv (QIIME/Mothur)
            </span>
            <span className="text-[11px] text-[#7a8885]">· Up to 50 MB</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <input
              id="biom-file-input"
              type="file"
              accept=".biom,.json,.txt,.tsv,.h5,.hdf5,.fastq,.fq,.gz,application/json"
              className="sr-only"
              onChange={(e) => {
                const next = e.target.files?.[0];
                if (next) void previewFile(next);
              }}
            />
            <label
              htmlFor="biom-file-input"
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1f4f4a] px-5 text-sm font-semibold text-[#f7f4ec] shadow-sm transition-transform hover:bg-[#143834] active:scale-95"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Choose File from Disk
            </label>

            {/* Quick Demo Dataset Loaders */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void loadExample("biom")}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#9a7b3c]/40 bg-[#fdfbf6] px-3 text-xs font-semibold text-[#9a7b3c] hover:bg-[#fbf7ee] hover:border-[#9a7b3c] transition-colors shadow-xs"
                title="Load standard BIOM 1.0 JSON with 2 clinical samples"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#9a7b3c]" />
                BIOM 1.0 (JSON)
              </button>

              <button
                type="button"
                onClick={() => void loadExample("hdf5")}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50/60 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 hover:border-emerald-600/50 transition-colors shadow-xs"
                title="Load native BIOM 2.1 HDF5 binary matrix"
              >
                <Binary className="h-3.5 w-3.5 text-emerald-700" />
                BIOM 2.1 (HDF5)
              </button>

              <button
                type="button"
                onClick={() => void loadExample("fastq")}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-sky-600/30 bg-sky-50/60 px-3 text-xs font-semibold text-sky-800 hover:bg-sky-100/70 hover:border-sky-600/50 transition-colors shadow-xs"
                title="Load 25,000 raw Illumina stool metagenomic reads"
              >
                <Dna className="h-3.5 w-3.5 text-sky-700" />
                FASTQ.gz (NGS)
              </button>
            </div>
          </div>

          {pending === "preview" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#1f4f4a]">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Analyzing observation matrix, Phred Q-scores, and taxonomy trees…</span>
            </div>
          )}
        </div>
      ) : (
        /* Loaded File Card */
        <div className="rounded-2xl border border-[#1f4f4a]/20 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#143834]">{file.name}</h3>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                    Uploaded
                  </span>
                  {preview?.qcMetrics?.formatType && (
                    <span className="rounded bg-[#1f4f4a]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#1f4f4a]">
                      {preview.qcMetrics.formatType === "biom_hdf5"
                        ? "BIOM 2.1 HDF5"
                        : preview.qcMetrics.formatType === "fastq"
                        ? "FASTQ NGS"
                        : preview.qcMetrics.formatType === "tsv_table"
                        ? "OTU TSV"
                        : "BIOM 1.0 JSON"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5c6b68]">
                  {(file.size / 1024).toFixed(1)} KB · Validated for clinical pipeline
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="inline-flex items-center gap-1 rounded-lg border border-[#1f4f4a]/15 bg-[#fbf8f1] px-2.5 py-1.5 text-xs font-medium text-[#4d5c59] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Change File
            </button>
          </div>

          {pending === "preview" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#1f4f4a]/5 px-3 py-2 text-xs text-[#1f4f4a]">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Extracting OTUs, taxonomy hierarchies, and calculating live QC metrics…</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIVE PRE-FLIGHT NGS QUALITY CONTROL (QC) TELEMETRY                      */}
      {/* ========================================================================= */}
      {preview?.qcMetrics && (
        <div className="overflow-hidden rounded-2xl border border-emerald-900/15 bg-gradient-to-br from-white via-[#fcfbf7] to-emerald-50/20 p-5 shadow-sm space-y-4">
          {/* Header with Title and Live QC Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f4f4a]/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                  NGS Pre-Flight Quality Control (QC) Telemetry
                </span>
                <h3 className="font-serif text-lg font-bold text-[#143834] flex items-center gap-2">
                  Automated Ingestion Quality Validation
                  <span className="inline-flex items-center rounded-md bg-[#1f4f4a]/10 px-2 py-0.5 font-mono text-[11px] font-medium text-[#1f4f4a]">
                    {preview.qcMetrics.formatType === "biom_hdf5"
                      ? "BIOM 2.1 (HDF5 Binary)"
                      : preview.qcMetrics.formatType === "fastq"
                      ? "FASTQ Metagenomics"
                      : preview.qcMetrics.formatType === "tsv_table"
                      ? "Classic OTU / TSV"
                      : "BIOM 1.0 (JSON)"}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {preview.qcMetrics.qcStatus === "pass" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  QC PASSED · CLINICAL GRADE
                </span>
              ) : preview.qcMetrics.qcStatus === "warn" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 shadow-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  QC BORDERLINE · REVIEW RECOMMENDED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800 shadow-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  QC WARNING · ELEVATED NOISE
                </span>
              )}
            </div>
          </div>

          {/* 4 Primary Clinical QC Metrics */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Mean Phred Q-Score */}
            <div className="rounded-xl border border-[#1f4f4a]/10 bg-white/90 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#5c6b68]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Phred Score (Q-Score)</span>
                <Activity className="h-3.5 w-3.5 text-[#1f4f4a]" />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black text-[#143834]">
                  Q{preview.qcMetrics.meanQScore}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  ({preview.qcMetrics.q30Percentage}% ≥ Q30)
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, preview.qcMetrics.q30Percentage))}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-[#5c6b68]">
                Illumina base accuracy &gt; 99.9%
              </p>
            </div>

            {/* 2. Host-Read Depletion */}
            <div className="rounded-xl border border-[#1f4f4a]/10 bg-white/90 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#5c6b68]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Host-Read Depletion</span>
                <Dna className="h-3.5 w-3.5 text-emerald-700" />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black text-[#143834]">
                  {preview.qcMetrics.hostDepletionPercentage}%
                </span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                  {preview.qcMetrics.hostDepletionPercentage >= 98 ? "Optimal" : "Adequate"}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, preview.qcMetrics.hostDepletionPercentage))}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-[#5c6b68]">
                {preview.qcMetrics.hostReadsCount != null
                  ? `${preview.qcMetrics.hostReadsCount.toLocaleString()} human host reads filtered`
                  : "Human host DNA depleted (< 1.5%)"}
              </p>
            </div>

            {/* 3. Classified Microbial Reads */}
            <div className="rounded-xl border border-[#1f4f4a]/10 bg-white/90 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#5c6b68]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Classified Read %</span>
                <Binary className="h-3.5 w-3.5 text-[#1f4f4a]" />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black text-[#143834]">
                  {preview.qcMetrics.classifiedPercentage}%
                </span>
                <span className="text-xs text-[#5c6b68]">taxonomically assigned</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1f4f4a] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, preview.qcMetrics.classifiedPercentage))}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-[#5c6b68]">
                Aligned against RefSeq gut taxonomic markers
              </p>
            </div>

            {/* 4. Total Sequencing Depth */}
            <div className="rounded-xl border border-[#1f4f4a]/10 bg-white/90 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#5c6b68]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Sequencing Depth</span>
                <Layers className="h-3.5 w-3.5 text-[#9a7b3c]" />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black text-[#143834]">
                  {preview.qcMetrics.totalRawReads.toLocaleString()}
                </span>
                <span className="text-xs text-[#5c6b68]">counts</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#4d5c59]">
                <span>Features: <strong>{preview.featureCount}</strong></span>
                {preview.matrixSparsityPercentage != null && preview.matrixSparsityPercentage > 0 ? (
                  <span>Sparsity: <strong>{preview.matrixSparsityPercentage}%</strong></span>
                ) : preview.qcMetrics.gcContentPercentage ? (
                  <span>GC: <strong>{preview.qcMetrics.gcContentPercentage}%</strong></span>
                ) : null}
                {preview.qcMetrics.averageReadLength && (
                  <span>Len: <strong>{preview.qcMetrics.averageReadLength} bp</strong></span>
                )}
              </div>
              <p className="mt-1.5 text-[10px] text-[#5c6b68]">
                {preview.matrixSparsityPercentage != null && preview.matrixSparsityPercentage > 0
                  ? `Sparsity: ${preview.matrixSparsityPercentage}% (Standard biological matrix)`
                  : "High statistical power for biomarker discovery"}
              </p>
            </div>
          </div>

          {/* QC Summary Callout */}
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3.5 py-2.5 text-xs text-emerald-950">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>
              <strong>Pre-Flight Telemetry:</strong> {preview.qcMetrics.qcSummary}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH INGESTION RESULTS BANNER & QUICK EXPORT                             */}
      {/* ========================================================================= */}
      {batchResult && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/80 p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-600/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  High-Throughput Batch Complete · {batchResult.batchId}
                </span>
                <h3 className="font-serif text-xl font-bold text-emerald-950">
                  {batchResult.totalProcessed} Cohort Samples Ingested Successfully
                </h3>
              </div>
            </div>
            <span className="rounded-full bg-emerald-200 border border-emerald-400 px-3 py-1 text-xs font-mono font-bold text-emerald-900">
              {batchResult.reportsGenerated} Reports Generated in MySQL
            </span>
          </div>

          <p className="text-xs text-emerald-900 leading-relaxed">
            All sample columns from the matrix have been registered into the LIMS database with full taxonomic normalization, CARD resistome screening, and 11 disease risk models. You can export report archives immediately or review them in the directory.
          </p>

          {/* Quick Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => downloadBatchExport("doctor")}
              disabled={isBatchDownloading !== null}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#143834] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#1f4f4a] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isBatchDownloading === "doctor" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4 text-emerald-300" />
              )}
              <span>Download Doctor Briefs ZIP</span>
            </button>

            <button
              type="button"
              onClick={() => downloadBatchExport("patient")}
              disabled={isBatchDownloading !== null}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white border border-[#1f4f4a]/20 px-3.5 text-xs font-bold text-[#143834] shadow-xs hover:bg-[#faf8f2] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isBatchDownloading === "patient" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4 text-[#1f4f4a]" />
              )}
              <span>Download Patient Booklets ZIP</span>
            </button>

            <button
              type="button"
              onClick={downloadBatchCsv}
              disabled={isBatchDownloading !== null}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white border border-[#1f4f4a]/20 px-3.5 text-xs font-bold text-[#143834] shadow-xs hover:bg-[#faf8f2] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isBatchDownloading === "csv" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 text-[#1f4f4a]" />
              )}
              <span>Cohort CSV</span>
            </button>

            <Link
              href="/reports"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-emerald-400 bg-emerald-100 px-3.5 text-xs font-bold text-emerald-900 hover:bg-emerald-200 transition-colors ml-auto"
            >
              <span>View in Reports Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MULTI-SAMPLE SELECTOR & MATRIX PREVIEW                                 */}
      {/* ========================================================================= */}
      {preview && (
        <div className="space-y-4 rounded-2xl border border-[#1f4f4a]/20 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f4f4a]/10 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                BIOM Table Verification
              </span>
              <h3 className="font-serif text-lg font-bold text-[#143834]">
                Detected Sample Columns ({preview.sampleIds.length})
              </h3>
            </div>

            {/* Mode Switcher when multiple samples are present */}
            {preview.sampleIds.length > 1 && (
              <div className="flex items-center rounded-xl bg-[#faf8f2] p-1 border border-[#1f4f4a]/15">
                <button
                  type="button"
                  onClick={() => setIngestMode("single")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    ingestMode === "single"
                      ? "bg-[#1f4f4a] text-white shadow-2xs"
                      : "text-[#5c6b68] hover:text-[#143834]"
                  }`}
                >
                  Single Case Ingest
                </button>
                <button
                  type="button"
                  onClick={() => setIngestMode("batch")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    ingestMode === "batch"
                      ? "bg-[#1f4f4a] text-white shadow-2xs"
                      : "text-[#5c6b68] hover:text-[#143834]"
                  }`}
                >
                  <Zap className="h-3 w-3 text-amber-300" />
                  <span>⚡ Batch Cohort ({preview.sampleIds.length})</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-[#5c6b68]">
              <span>
                <strong>{preview.featureCount.toLocaleString()}</strong> features
              </span>
              <span>·</span>
              <span>
                Taxonomy:{" "}
                <strong className={preview.taxonomyPresent ? "text-emerald-700" : "text-amber-700"}>
                  {preview.taxonomyPresent ? "Annotated" : "Unannotated"}
                </strong>
              </span>
              <span>·</span>
              <span>
                Format: <strong>{preview.format}</strong>
              </span>
            </div>
          </div>

          {/* Conditional Rendering: Batch Cohort Mode vs Single Sample Selector */}
          {ingestMode === "batch" ? (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#faf8f2] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-[#143834]">
                      Cohort Sample Selection ({batchSelectedIds.length} of {preview.sampleIds.length} active)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBatchSelectedIds(
                          batchSelectedIds.length === preview.sampleIds.length
                            ? []
                            : [...preview.sampleIds]
                        )
                      }
                      className="text-[11px] font-semibold text-[#1f4f4a] hover:underline cursor-pointer"
                    >
                      {batchSelectedIds.length === preview.sampleIds.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {preview.sampleIds.map((id) => {
                    const count = Math.round(preview.totalCounts[id] ?? 0);
                    const isChecked = batchSelectedIds.includes(id);
                    const isIbd = id.toLowerCase().includes("ibd");
                    const isWellness = id.toLowerCase().includes("wellness");

                    return (
                      <label
                        key={id}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                          isChecked
                            ? "border-[#1f4f4a] bg-white ring-1 ring-[#1f4f4a]/20 shadow-xs"
                            : "border-gray-200 bg-white/50 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBatchSelectedIds((prev) => [...prev, id]);
                            } else {
                              setBatchSelectedIds((prev) => prev.filter((it) => it !== id));
                            }
                          }}
                          className="mt-0.5 size-4 rounded border-gray-300 accent-[#1f4f4a]"
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[#143834]">{id}</span>
                            <span className="font-mono text-[10px] text-gray-500">
                              {count.toLocaleString()} counts
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-gray-500">
                            {isIbd
                              ? "IBD / Dysbiosis Pattern"
                              : isWellness
                              ? "Wellness Baseline"
                              : "Clinical Cohort"}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Batch Indication & Execution Form */}
              <form onSubmit={onBatchProcess} className="space-y-3 rounded-xl border border-[#1f4f4a]/20 bg-white p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#143834]">
                    Cohort Clinical Indication:
                  </Label>
                  <Input
                    value={batchIndication}
                    onChange={(e) => setBatchIndication(e.target.value)}
                    placeholder="e.g. High-throughput metagenomic surveillance cohort"
                    className="h-9 text-xs rounded-lg border-[#1f4f4a]/20 focus-visible:ring-[#1f4f4a]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!batchSelectedIds.length || pending === "process"}
                  className="h-11 w-full rounded-xl bg-[#143834] text-xs font-bold text-white shadow hover:bg-[#1f4f4a] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>
                    Batch Ingest &amp; Generate All {batchSelectedIds.length} Samples ({batchSelectedIds.length * 3} Reports)
                  </span>
                </Button>
              </form>
            </div>
          ) : (
            /* Multi-Sample Selector Grid */
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#143834]">
                Select Active Sample for Clinical Report Generation:
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {preview.sampleIds.map((id) => {
                  const count = Math.round(preview.totalCounts[id] ?? 0);
                  const isSelected = biomSampleId === id;
                  const isIbd = id.toLowerCase().includes("ibd");
                  const isWellness = id.toLowerCase().includes("wellness");

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectSample(id)}
                      className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-[#1f4f4a] bg-[#1f4f4a]/5 ring-2 ring-[#1f4f4a]/25 shadow-xs"
                          : "border-[#1f4f4a]/15 bg-[#fdfbf7] hover:border-[#1f4f4a]/40 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Layers className={`h-4 w-4 ${isSelected ? "text-[#1f4f4a]" : "text-[#7a8885]"}`} />
                          <span className="font-mono text-sm font-bold text-[#143834]">{id}</span>
                        </div>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#1f4f4a] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            <CheckCircle2 className="h-3 w-3" /> Selected
                          </span>
                        ) : (
                          <span className="rounded-full border border-[#1f4f4a]/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#6a7875]">
                            Select
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline justify-between text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-wide text-[#6a7875] block">
                            Total Counts
                          </span>
                          <span className="font-mono font-bold text-[#143834]">
                            {count.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wide text-[#6a7875] block">
                            Signal Profile
                          </span>
                          <span className="font-medium text-[#2d4c46]">
                            {isIbd
                              ? "IBD / Dysbiosis Pattern"
                              : isWellness
                              ? "Wellness Baseline"
                              : "Clinical Cohort"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PRE-FLIGHT TAXONOMIC LANDSCAPE & CLINICAL SIGNALS                      */}
      {/* ========================================================================= */}
      {preview && activeTaxaPreview && ingestMode === "single" && (
        <div className="space-y-4 rounded-2xl border border-[#1f4f4a]/20 bg-white p-5 shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f4f4a]/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1f4f4a]/10 text-[#1f4f4a]">
                <Microscope className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
                  Pre-Flight Metagenomic Profiler
                </span>
                <h3 className="font-serif text-lg font-bold text-[#143834] flex items-center gap-2">
                  Taxonomic Landscape: <span className="font-mono text-[#1f4f4a]">{biomSampleId}</span>
                </h3>
              </div>
            </div>

            {/* F/B Ratio Badge */}
            {activeTaxaPreview.fbRatio != null && (
              <div className="flex items-center gap-1.5 rounded-lg border border-[#1f4f4a]/15 bg-[#faf8f2] px-2.5 py-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-[#6a7875]">F/B Ratio:</span>
                <span className="font-mono font-bold text-[#143834]">{activeTaxaPreview.fbRatio}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                    activeTaxaPreview.fbRatio >= 0.8 && activeTaxaPreview.fbRatio <= 2.5
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {activeTaxaPreview.fbRatio >= 0.8 && activeTaxaPreview.fbRatio <= 2.5
                    ? "Eubiotic Balance"
                    : activeTaxaPreview.fbRatio > 2.5
                    ? "Firmicutes Dominant"
                    : "Bacteroidota Dominant"}
                </span>
              </div>
            )}
          </div>

          {/* Phylum Composition Stacked Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#5c6b68]">
              <span className="font-semibold text-[#143834] text-[11px]">Phylum Abundance Spectrum</span>
              <span className="text-[10px]">
                Total Classified: {preview.qcMetrics?.classifiedPercentage ?? 100}%
              </span>
            </div>

            {/* Stacked Bar */}
            <div className="h-4 w-full rounded-lg bg-gray-100 flex overflow-hidden shadow-inner">
              {activeTaxaPreview.phyla.map((p) => (
                <div
                  key={p.phylum}
                  className="h-full transition-all duration-500 relative group"
                  style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                  title={`${p.phylum}: ${p.percentage}%`}
                />
              ))}
            </div>

            {/* Legend Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              {activeTaxaPreview.phyla.map((p) => (
                <div
                  key={p.phylum}
                  className="flex items-center gap-1.5 rounded-md border border-[#1f4f4a]/10 bg-white px-2 py-0.5"
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[#143834] font-medium">{p.phylum}</span>
                  <span className="font-mono font-bold text-[#6a7875] text-[10px]">{p.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 6 Detected Species Grid */}
          <div className="space-y-2 pt-2 border-t border-[#1f4f4a]/10">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#143834]">
                Dominant Detected Taxa &amp; Sentinel Microorganisms:
              </Label>
              <span className="text-[10px] text-[#7a8885]">Top Abundance OTUs / Species</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activeTaxaPreview.topTaxa.slice(0, 6).map((t, idx) => {
                const isBeneficial = t.role === "beneficial";
                const isHarmful = t.role === "harmful";

                return (
                  <div
                    key={t.taxon}
                    className={`rounded-xl border p-2.5 shadow-2xs flex flex-col justify-between transition-all ${
                      isBeneficial
                        ? "border-emerald-200 bg-emerald-50/40"
                        : isHarmful
                        ? "border-rose-200 bg-rose-50/40"
                        : "border-[#1f4f4a]/12 bg-[#faf8f2]/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <span className="text-[8px] font-bold text-[#7a8885] uppercase tracking-wider block">
                            Rank #{idx + 1} · {t.phylum}
                          </span>
                          <h4
                            className="font-serif italic text-xs font-bold text-[#143834] truncate mt-0.5"
                            title={t.taxon}
                          >
                            {t.taxon}
                          </h4>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider shrink-0 border ${
                            isBeneficial
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : isHarmful
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {isBeneficial ? "Beneficial" : isHarmful ? "Harmful" : "Normal"}
                        </span>
                      </div>

                      {/* Bar Gauge */}
                      <div className="mt-2 h-1 w-full rounded-full bg-black/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isBeneficial
                              ? "bg-emerald-600"
                              : isHarmful
                              ? "bg-rose-600"
                              : "bg-[#1f4f4a]"
                          }`}
                          style={{ width: `${Math.min(100, t.relativeAbundance * 3)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#5c6b68] border-t border-black/5 pt-1">
                      <span className="font-mono font-bold text-[#143834]">{t.relativeAbundance}%</span>
                      <span className="text-[9px] text-[#6a7875] truncate max-w-[130px]">
                        {t.clinicalTag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pre-Flight Early Warning / Signal Flags */}
          {activeTaxaPreview.signals.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#1f4f4a]/10">
              <Label className="text-xs font-semibold text-[#143834] flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#1f4f4a]" />
                Automated Clinical Pattern Signals (Pre-Flight Screening):
              </Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {activeTaxaPreview.signals.map((sig, sIdx) => {
                  const isPos = sig.type === "positive";
                  const isWarn = sig.type === "warning";

                  return (
                    <div
                      key={sIdx}
                      className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs shadow-2xs ${
                        isPos
                          ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                          : isWarn
                          ? "border-amber-200 bg-amber-50/70 text-amber-950"
                          : "border-blue-200 bg-blue-50/70 text-blue-950"
                      }`}
                    >
                      {isPos ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      ) : isWarn ? (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      ) : (
                        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-[11px] block">{sig.title}</span>
                        <p className="mt-0.5 text-[10px] leading-snug opacity-90">{sig.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CLINICAL CASE METADATA FORM                                            */}
      {/* ========================================================================= */}
      {ingestMode === "single" && (
        <form onSubmit={onProcess} className="space-y-4 rounded-2xl border border-[#1f4f4a]/20 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1f4f4a]/10 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a7b3c]">
              Patient Demographic &amp; Clinical Context
            </span>
            <h3 className="font-serif text-lg font-bold text-[#143834]">
              Case Metadata
            </h3>
          </div>
          <span className="text-xs text-[#6a7875]">Required for risk scoring</span>
        </div>

        {/* Quick Indication Presets */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#143834]">
            Quick Clinical Indication Presets:
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {indicationPresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setIndication(p.text)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  indication === p.text
                    ? "border-[#1f4f4a] bg-[#1f4f4a] text-white font-medium shadow-xs"
                    : "border-[#1f4f4a]/20 bg-[#fbf8f1] text-[#3d4c49] hover:border-[#1f4f4a]/50 hover:bg-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs font-medium text-[#143834]">
              Case Label / Profile Name
            </Label>
            <Input
              id="displayName"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Adult, BIOM Import"
              className="rounded-xl border-[#1f4f4a]/20 focus-visible:ring-[#1f4f4a]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="patientCode" className="text-xs font-medium text-[#143834]">
              Patient Code / MRN
            </Label>
            <Input
              id="patientCode"
              name="patientCode"
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
              placeholder="e.g. ONC-9481"
              className="rounded-xl border-[#1f4f4a]/20 focus-visible:ring-[#1f4f4a]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="age" className="text-xs font-medium text-[#143834]">
              Patient Age (Years)
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || 40)}
              className="rounded-xl border-[#1f4f4a]/20 focus-visible:ring-[#1f4f4a]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sex" className="text-xs font-medium text-[#143834]">
              Biological Sex
            </Label>
            <select
              id="sex"
              name="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as "female" | "male" | "unspecified")}
              className="h-10 w-full rounded-xl border border-[#1f4f4a]/20 bg-white px-3 text-sm text-[#143834] focus:outline-none focus:ring-2 focus:ring-[#1f4f4a]"
            >
              <option value="unspecified">Unspecified / Unknown</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="indication" className="text-xs font-medium text-[#143834]">
            Clinical Indication &amp; Referral Reason
          </Label>
          <Textarea
            id="indication"
            name="indication"
            rows={2}
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            placeholder="e.g. Persistent diarrhea, calprotectin 180, evaluate microbiome for IBD dysbiosis"
            className="rounded-xl border-[#1f4f4a]/20 focus-visible:ring-[#1f4f4a]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dietPattern" className="text-xs font-medium text-[#143834]">
            Dietary History / Nutritional Pattern
          </Label>
          <Input
            id="dietPattern"
            name="dietPattern"
            value={dietPattern}
            onChange={(e) => setDietPattern(e.target.value)}
            placeholder="e.g. Mediterranean, Western diet, low FODMAP, vegetarian"
            className="rounded-xl border-[#1f4f4a]/20 focus-visible:ring-[#1f4f4a]"
          />
        </div>

        {/* Antibiotic Checkbox Switch */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1f4f4a]/15 bg-[#fbf8f1] p-3 text-sm transition-colors hover:bg-white">
          <input
            type="checkbox"
            name="recentAntibiotics"
            checked={recentAntibiotics}
            onChange={(e) => setRecentAntibiotics(e.target.checked)}
            className="mt-0.5 size-4 rounded border-gray-300 accent-[#1f4f4a]"
          />
          <div>
            <span className="font-semibold text-[#143834] block">
              Antimicrobial Exposure within Last 8 Weeks
            </span>
            <span className="text-xs text-[#5c6b68]">
              Enables post-antibiotic dysbiosis recovery modeling and resistome persistence flags.
            </span>
          </div>
        </label>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
            <X className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={!file || !preview || pending === "process"}
          className="h-12 w-full rounded-xl bg-[#1f4f4a] text-sm font-semibold text-white shadow-md hover:bg-[#143834] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {pending === "process" ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Analyzing Metagenomic Profiles &amp; Generating 3 Reports…</span>
            </>
          ) : (
            <>
              <span>Process All Three Clinical Reports (Doctor, Patient &amp; Detailed)</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      )}

      {/* ========================================================================= */}
      {/* 6. BIOINFORMATICS PIPELINE PROCESSING MODAL                               */}
      {/* ========================================================================= */}
      {pending === "process" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#1f4f4a]/20 bg-white p-6 shadow-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f4f4a]/10 text-[#1f4f4a] ring-8 ring-[#1f4f4a]/5">
                <Microscope className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#143834]">
                {ingestMode === "batch"
                  ? "High-Throughput Cohort Pipeline Active"
                  : "Bioinformatics Pipeline Active"}
              </h3>
              <p className="text-xs text-[#5c6b68]">
                {ingestMode === "batch" ? (
                  <>
                    Processing cohort of{" "}
                    <strong className="text-[#143834]">{batchSelectedIds.length} samples</strong> (
                    {batchSelectedIds.length * 3} clinical reports)
                  </>
                ) : (
                  <>
                    Synthesizing multi-tier clinical reports for sample{" "}
                    <span className="font-mono font-bold text-[#1f4f4a]">{biomSampleId}</span>
                  </>
                )}
              </p>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#5c6b68]">
                <span>Pipeline Progress</span>
                <span className="font-mono font-bold text-[#1f4f4a]">
                  {Math.round((processingStage / 4) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1f4f4a] transition-all duration-500 ease-out"
                  style={{ width: `${(processingStage / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Pipeline Stage Steps */}
            <div className="space-y-3">
              {[
                {
                  stage: 1,
                  title: "Taxonomic Profiling & Relative Abundance",
                  desc: "Aligning counts to NCBI/RefSeq microbial taxonomy tree and calculating species distributions.",
                  icon: Dna,
                },
                {
                  stage: 2,
                  title: "Resistome & Pathobiont Screening",
                  desc: "Scanning Comprehensive Antibiotic Resistance Database (CARD) and potential overgrowth alerts.",
                  icon: ShieldAlert,
                },
                {
                  stage: 3,
                  title: "Dysbiosis & Clinical Cohort Risk Modeling",
                  desc: "Executing metabolic pathway engines, SCFA synthesis metrics, and clinical risk classifiers.",
                  icon: Activity,
                },
                {
                  stage: 4,
                  title: "Multi-Tier Clinical Report Synthesis",
                  desc: "Compiling Doctor (Tier-1), Patient (Tier-2), and 30-Page Technical (Tier-3) Reports.",
                  icon: FileSpreadsheet,
                },
              ].map(({ stage, title, desc }) => {
                const isComplete = processingStage > stage;
                const isCurrent = processingStage === stage;

                return (
                  <div
                    key={stage}
                    className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                      isCurrent
                        ? "border-[#1f4f4a] bg-[#1f4f4a]/5 ring-1 ring-[#1f4f4a]/20 shadow-xs"
                        : isComplete
                        ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                        : "border-gray-200/80 bg-gray-50/50 opacity-60"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isComplete ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : isCurrent ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1f4f4a] text-white">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[10px] font-bold text-gray-400">
                          {stage}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? "text-[#143834]"
                              : isComplete
                              ? "text-emerald-900"
                              : "text-gray-500"
                          }`}
                        >
                          {title}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-[#1f4f4a]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1f4f4a]">
                            Running
                          </span>
                        )}
                        {isComplete && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#5c6b68] leading-tight">
                        {desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-[#1f4f4a]/10 bg-[#faf8f2] p-2.5 text-center text-[11px] text-[#5c6b68]">
              Generating synchronized records across LIMS database and PDF rendering pipelines…
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
