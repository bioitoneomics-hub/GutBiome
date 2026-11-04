import { notFound } from "next/navigation";
import { DetailedReport } from "@/components/reports/detailed-report";
import { DoctorReport } from "@/components/reports/doctor-report";
import { PatientReport } from "@/components/reports/patient-report";
import { ReportToolbar } from "@/components/reports/report-toolbar";
import { analyzeSample } from "@/lib/microbiome/engine";
import { getBiomTable, getReportRecord, getSample } from "@/lib/store";
import type { ReportType } from "@/lib/microbiome/types";

export default async function ReportViewPage({
  params,
}: {
  params: Promise<{ sampleId: string; type: string }>;
}) {
  const { sampleId, type } = await params;
  if (!["doctor", "patient", "detailed"].includes(type)) notFound();
  const sample = await getSample(sampleId);
  if (!sample) notFound();
  const biom = await getBiomTable(sampleId);
  const analysis = analyzeSample(sample, biom);
  const reportType = type as ReportType;
  const reportRecord = await getReportRecord(sampleId, reportType);

  return (
    <div className="min-h-full bg-[#e8ebe8]">
      <ReportToolbar sampleId={sampleId} type={reportType} reportRecord={reportRecord} />
      <div className="report-stack space-y-6 px-3 py-6 print:space-y-0 print:p-0">
        {reportType === "doctor" && <DoctorReport analysis={analysis} reportRecord={reportRecord} />}
        {reportType === "patient" && <PatientReport analysis={analysis} />}
        {reportType === "detailed" && <DetailedReport analysis={analysis} />}
      </div>
    </div>
  );
}
