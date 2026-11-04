import { notFound } from "next/navigation";
import { DetailedReport } from "@/components/reports/detailed-report";
import { DoctorReport } from "@/components/reports/doctor-report";
import { PatientReport } from "@/components/reports/patient-report";
import { ReportToolbar } from "@/components/reports/report-toolbar";
import { analyzeSample } from "@/lib/microbiome/engine";
import { getBiomTable, getReportRecord, getSample } from "@/lib/store";

export default async function AllReportsPage({
  params,
}: {
  params: Promise<{ sampleId: string }>;
}) {
  const { sampleId } = await params;
  const sample = await getSample(sampleId);
  if (!sample) notFound();
  const biom = await getBiomTable(sampleId);
  const analysis = analyzeSample(sample, biom);
  const doctorRecord = await getReportRecord(sampleId, "doctor");

  return (
    <div className="min-h-full bg-[#e8ebe8]">
      <ReportToolbar sampleId={sampleId} type="all" reportRecord={doctorRecord} />
      <div className="report-stack space-y-6 px-3 py-6 print:space-y-0 print:p-0">
        <DoctorReport analysis={analysis} reportRecord={doctorRecord} />
        <PatientReport analysis={analysis} />
        <DetailedReport analysis={analysis} />
      </div>
    </div>
  );
}
