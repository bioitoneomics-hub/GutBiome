import fs from "fs";
import puppeteer, { type Browser } from "puppeteer-core";
import JSZip from "jszip";
import { getSample, listSamples, getBiomTable, listReportsForSample } from "@/lib/store";
import { analyzeSample } from "@/lib/microbiome/engine";
import type { ReportType } from "@/lib/microbiome/types";

export function getChromeExecutablePath(): string {
  const envPath = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(/* turbopackIgnore: true */ envPath)) return envPath;

  const commonPaths = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(/* turbopackIgnore: true */ p)) return p;
  }

  throw new Error(
    "Google Chrome or Chromium executable not found on server. Please install Chrome or configure CHROME_PATH."
  );
}

export interface RenderedPdfItem {
  sampleId: string;
  accession: string;
  patientCode: string;
  filename: string;
  buffer: Buffer;
}

/**
 * Configure page for pixel-perfect A4 printing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function prepareReportPage(page: any, targetUrl: string) {
  await page.setViewport({
    width: 1200,
    height: 1600,
    deviceScaleFactor: 2,
  });

  await page.goto(targetUrl, {
    waitUntil: ["networkidle0", "domcontentloaded"],
    timeout: 35000,
  });

  await page.emulateMediaType("print");
  await page.evaluateHandle("document.fonts.ready");

  // Inject PDF-only formatting to enforce exact A4 boundaries and avoid orphan breaks
  await page.addStyleTag({
    content: `
      @page {
        size: 210mm 297mm;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
      }
      .report-page {
        box-sizing: border-box !important;
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    `,
  });

  // Ensure each page fits exact A4 dimensions without artificial scaling
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages = document.querySelectorAll(".report-page");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pages.forEach((el: any) => {
      el.style.width = "210mm";
      el.style.height = "297mm";
      el.style.maxHeight = "297mm";
      el.style.overflow = "hidden";
      el.style.boxSizing = "border-box";
    });
  });
}

/**
 * Render a single report as PDF
 */
export async function renderReportPdf(
  sampleId: string,
  reportType: ReportType | "all",
  baseUrl = "http://localhost:43123"
): Promise<RenderedPdfItem> {
  const sample = await getSample(sampleId);
  if (!sample) {
    throw new Error(`Sample not found: ${sampleId}`);
  }

  const chromePath = getChromeExecutablePath();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });

  try {
    const page = await browser.newPage();
    const reportPath =
      reportType === "all"
        ? `/reports/${sampleId}/all`
        : `/reports/${sampleId}/${reportType}`;
    const targetUrl = `${baseUrl.replace(/\/$/, "")}${reportPath}`;

    await prepareReportPage(page, targetUrl);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    const filename = `MYGUTBIOME_${sample.accession}_${sample.patientCode}_${reportType.toUpperCase()}_REPORT.pdf`;

    return {
      sampleId,
      accession: sample.accession,
      patientCode: sample.patientCode,
      filename,
      buffer: Buffer.from(pdfBuffer),
    };
  } finally {
    await browser.close().catch(() => {});
  }
}

/**
 * Batch render reports for multiple samples using a shared headless browser instance
 */
export async function renderBatchPdfs(
  sampleIds: string[],
  reportType: ReportType | "all",
  baseUrl = "http://localhost:43123"
): Promise<RenderedPdfItem[]> {
  if (!sampleIds.length) return [];

  const chromePath = getChromeExecutablePath();
  let browser: Browser | null = null;
  const results: RenderedPdfItem[] = [];

  try {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });

    for (const sid of sampleIds) {
      const sample = await getSample(sid);
      if (!sample) continue;

      const page = await browser.newPage();
      try {
        const reportPath =
          reportType === "all"
            ? `/reports/${sid}/all`
            : `/reports/${sid}/${reportType}`;
        const targetUrl = `${baseUrl.replace(/\/$/, "")}${reportPath}`;

        await prepareReportPage(page, targetUrl);

        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
          preferCSSPageSize: true,
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        const filename = `MYGUTBIOME_${sample.accession}_${sample.patientCode}_${reportType.toUpperCase()}_REPORT.pdf`;
        results.push({
          sampleId: sid,
          accession: sample.accession,
          patientCode: sample.patientCode,
          filename,
          buffer: Buffer.from(pdfBuffer),
        });
      } finally {
        await page.close().catch(() => {});
      }
    }

    return results;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Generate a rich clinical cohort spreadsheet (CSV format)
 */
export async function generateCohortSummaryCsv(sampleIds?: string[]): Promise<string> {
  const allSamples = await listSamples();
  const samples = sampleIds?.length
    ? allSamples.filter((s) => sampleIds.includes(s.id))
    : allSamples;

  const rows: string[][] = [
    [
      "Sample ID",
      "Accession",
      "Patient Code (MRN)",
      "Patient Profile",
      "Age",
      "Biological Sex",
      "Clinical Indication",
      "Dietary Pattern",
      "Recent Antibiotics",
      "Collection Date",
      "Gut Score (0-100)",
      "Shannon Diversity",
      "F/B Ratio",
      "Key Sentinels (Beneficial)",
      "Pathobiont Carriage Alerts",
      "Critical AMR Resistome",
      "Doctor Sign-Off Status",
      "Doctor Signed-Off By",
      "Doctor Report URL",
      "Patient Report URL",
      "Detailed Report URL",
    ],
  ];

  for (const s of samples) {
    const biom = await getBiomTable(s.id);
    const analysis = analyzeSample(s, biom);
    const dbReports = await listReportsForSample(s.id);
    const doctorRep = dbReports.find((r) => r.reportType === "doctor");

    // Keystone beneficial summary
    const keySentinels = analysis.beneficial
      .slice(0, 3)
      .map((st) => `${st.taxon} (${st.relativeAbundance}%)`)
      .join("; ") || "Standard baseline";

    // Pathobionts
    const alerts = analysis.pathogens
      .filter((p) => p.relativeAbundance > 0)
      .map((p) => `${p.taxon} (${p.relativeAbundance}%)`)
      .join("; ") || "None detected";

    // AMR
    const amrList = analysis.amr
      .filter((a) => a.level === "critical" || a.level === "high")
      .map((a) => a.gene)
      .join("; ") || "None detected";

    const fbRatio = analysis.diversity.firmicutesBacteroidota
      ? analysis.diversity.firmicutesBacteroidota.toFixed(2)
      : "N/A";
    const status = doctorRep?.status === "signed_off" ? "Signed Off" : "Pending Review";
    const signedBy = doctorRep?.signedOffBy || "Unsigned";

    rows.push([
      s.id,
      s.accession,
      s.patientCode,
      s.displayName,
      String(s.age),
      s.sex,
      s.indication,
      s.dietPattern,
      s.recentAntibiotics ? "Yes" : "No",
      s.collectionDate,
      String(analysis.gutScore),
      analysis.diversity.shannon.toFixed(2),
      fbRatio,
      keySentinels,
      alerts,
      amrList,
      status,
      signedBy,
      `/reports/${s.id}/doctor`,
      `/reports/${s.id}/patient`,
      `/reports/${s.id}/detailed`,
    ]);
  }

  // Format as RFC 4180 CSV
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? "");
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    )
    .join("\r\n");
}

/**
 * Create a bundled ZIP file containing reports and cohort metadata
 */
export async function createBatchReportsZip(params: {
  pdfs: RenderedPdfItem[];
  csvContent?: string;
  reportType: string;
}): Promise<Buffer> {
  const zip = new JSZip();

  // Add all PDFs
  for (const item of params.pdfs) {
    zip.file(item.filename, item.buffer);
  }

  // Add Cohort CSV Summary
  if (params.csvContent) {
    zip.file("COHORT_ANALYTICS_SUMMARY.csv", params.csvContent);
  }

  // Add Readme / Manifest
  const manifest = [
    `ONEOMICS MYGUTBIOME CLINICAL BATCH EXPORT`,
    `==========================================`,
    `Report Tier: ${params.reportType.toUpperCase()}`,
    `Generated At: ${new Date().toISOString()}`,
    `Total Reports Included: ${params.pdfs.length}`,
    ``,
    `Files in Archive:`,
    ...params.pdfs.map((p, idx) => `  ${idx + 1}. ${p.filename}`),
    ...(params.csvContent ? [`  *. COHORT_ANALYTICS_SUMMARY.csv`] : []),
    ``,
    `Notice: This archive contains confidential clinical metagenomic reports governed by HIPAA/GDPR clinical data privacy compliance.`,
  ].join("\r\n");

  zip.file("MANIFEST.txt", manifest);

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return zipBuffer;
}
