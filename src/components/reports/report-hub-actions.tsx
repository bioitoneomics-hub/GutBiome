"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  FileCheck2,
} from "lucide-react";

interface ReportHubActionsProps {
  sampleId: string;
  accession: string;
  sampleName: string;
  patientCode: string;
}

export function ReportHubActions({
  sampleId,
  accession,
  sampleName,
  patientCode,
}: ReportHubActionsProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/samples/${sampleId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete sample.");
      }

      // Redirect back to dashboard
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Delete sample error:", err);
      setDeleteError(err.message || "An unexpected error occurred while deleting the sample.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/reports/${sampleId}/doctor`}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#143834] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#1f4f4a] transition-all"
        >
          <span>Open Doctor Report</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setIsDeleteModalOpen(true);
          }}
          title="Delete this accession and its reports"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-900 transition-colors shadow-2xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Accession</span>
        </button>
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {isDeleteModalOpen && (
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
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-lg p-1 text-[#7a8885] hover:bg-gray-100 hover:text-[#143834]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[#1f4f4a]/15 bg-[#fbf8f1] p-3 text-xs text-[#3d4c49] space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#143834]">Accession ID:</span>
                  <span className="font-mono font-bold text-[#143834]">{accession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#143834]">Patient MRN:</span>
                  <span className="font-mono">{patientCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#143834]">Sample Name:</span>
                  <span className="text-[#143834] font-medium">{sampleName}</span>
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 leading-relaxed">
                <p className="font-bold text-rose-950">⚠️ Warning: This action is permanent.</p>
                <p className="mt-1 text-[11px] text-rose-800">
                  Deleting this sample will permanently purge the metagenomic matrix, sample metadata, and all associated Doctor, Patient, and Detailed reports from the MySQL database.
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
                onClick={() => setIsDeleteModalOpen(false)}
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
    </>
  );
}
