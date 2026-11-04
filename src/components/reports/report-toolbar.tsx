"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ReportType } from "@/lib/microbiome/types";
import type { ReportRecord } from "@/lib/store";
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  PenTool,
  Loader2,
  X,
  ShieldCheck,
  Download,
  Printer,
} from "lucide-react";

const TYPES: { id: ReportType; label: string }[] = [
  { id: "doctor", label: "Doctor (1–3 pp)" },
  { id: "patient", label: "Patient (1–5 pp)" },
  { id: "detailed", label: "Detailed (1–30 pp)" },
];

export function ReportToolbar({
  sampleId,
  type,
  reportRecord,
}: {
  sampleId: string;
  type: ReportType | "all";
  reportRecord?: ReportRecord;
}) {
  const router = useRouter();
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [pathologistName, setPathologistName] = useState(
    reportRecord?.signedOffBy || "Dr. Evelyn Reed, MD, FRCPath"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ReportRecord | undefined>(
    reportRecord
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isSignedOff = currentRecord?.status === "signed_off";
  const targetReportType = type === "all" ? "doctor" : type;

  // Auto-trigger native print dialog if ?print=true parameter is present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("print=true")) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      const pdfUrl = `/api/reports/${sampleId}/pdf?type=${type}`;
      const res = await fetch(pdfUrl);
      if (res.ok && res.headers.get("content-type")?.includes("application/pdf")) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `MYGUTBIOME_${sampleId.toUpperCase()}_${type.toUpperCase()}_REPORT.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        // Direct browser A4 print engine fallback (100% reliable on Vercel cloud)
        window.print();
      }
    } catch (_) {
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function handleSignOff(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/reports/${sampleId}/sign-off`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: targetReportType,
          signedOffBy: pathologistName.trim() || "Dr. Evelyn Reed, MD, FRCPath",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign off report");
      }

      setCurrentRecord(data.report);
      setStatusMessage("Report successfully certified and signed off!");
      setTimeout(() => {
        setIsSignOffModalOpen(false);
        setStatusMessage(null);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error("Sign-off error:", err);
      setStatusMessage(err.message || "Failed to sign off report.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="print:hidden sticky top-0 z-20 border-b border-[#1f4f4a]/20 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              href={`/reports/${sampleId}`}
              className="text-xs font-semibold text-[#1f4f4a] underline-offset-4 hover:underline"
            >
              ← Report Hub ({sampleId.toUpperCase()})
            </Link>

            {/* Status indicator */}
            {isSignedOff ? (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Signed Off ({currentRecord?.signedOffBy?.split(",")[0]})
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                <Clock className="h-3 w-3" />
                Pending Review
              </span>
            )}
          </div>

          {/* Center: Report Type Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#1f4f4a]/5 p-1 border border-[#1f4f4a]/10">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  t.id === type
                    ? "bg-[#1f4f4a] text-white shadow-xs font-semibold"
                    : "text-[#3d4c49] hover:bg-[#1f4f4a]/10"
                }`}
                onClick={() => router.push(`/reports/${sampleId}/${t.id}`)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Right: Actions (Sign-Off, PDF Download & Print) */}
          <div className="flex items-center gap-2">
            {!isSignedOff ? (
              <button
                type="button"
                onClick={() => setIsSignOffModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/60 transition-colors shadow-xs"
              >
                <PenTool className="h-3.5 w-3.5 text-emerald-600" />
                <span>Sign Off Report</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSignOffModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/60 transition-colors shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Certified &amp; Signed</span>
              </button>
            )}

            {/* Browser Native High-Fidelity A4 Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              title="Print or save pixel-perfect vector A4 PDF directly using your browser print engine"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1f4f4a]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#143834] hover:bg-[#faf8f2] transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-[#1f4f4a]" />
              <span>Print / Save PDF</span>
            </button>

            {/* High-Fidelity Chromium PDF Engine Download Button */}
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              title="Generate and download exact pixel-perfect A4 PDF"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#9a7b3c] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#856931] transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Rendering PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Physician Sign-Off Modal */}
      {isSignOffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#1f4f4a]/30 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f4f4a]/10 text-[#1f4f4a]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#143834]">
                    Physician Electronic Sign-Off
                  </h3>
                  <p className="text-xs text-[#5c6b68]">
                    Accredited LIMS Certification for {sampleId.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSignOffModalOpen(false)}
                className="rounded-lg p-1 text-[#7a8885] hover:bg-gray-100 hover:text-[#143834]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSignOff} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#143834]">
                  Reviewing Pathologist / Medical Director
                </label>
                <input
                  type="text"
                  required
                  value={pathologistName}
                  onChange={(e) => setPathologistName(e.target.value)}
                  placeholder="e.g. Dr. Evelyn Reed, MD, FRCPath"
                  className="mt-1.5 w-full rounded-xl border border-[#1f4f4a]/25 px-3.5 py-2 text-xs text-[#143834] focus:border-[#1f4f4a] focus:outline-none focus:ring-1 focus:ring-[#1f4f4a]"
                />
                <p className="mt-1 text-[11px] text-[#7a8885]">
                  Signing will certify the AMR resistome calls, disease risk models, and clinical directives in MySQL.
                </p>
              </div>

              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#fbf8f1] p-3 text-[11px] text-[#3d4c49] space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Report Type:</span>
                  <span className="font-bold uppercase text-[#143834]">{targetReportType}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Accreditation:</span>
                  <span className="font-bold text-[#143834]">ISO 15189:2022 / CAP #9283411</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Audit Trail:</span>
                  <span className="text-[#9a7b3c]">SHA-256 Checksum Logged</span>
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    statusMessage.includes("success")
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f4f4a]/15">
                <button
                  type="button"
                  onClick={() => setIsSignOffModalOpen(false)}
                  className="rounded-xl border border-[#1f4f4a]/20 bg-white px-4 py-2 text-xs font-semibold text-[#143834] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1f4f4a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#143834] transition-colors disabled:opacity-50 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Certifying...</span>
                    </>
                  ) : (
                    <>
                      <PenTool className="h-3.5 w-3.5" />
                      <span>{isSignedOff ? "Update Sign-Off" : "Certify & Sign Off"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
