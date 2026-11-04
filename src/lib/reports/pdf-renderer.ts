import fs from "fs";
import puppeteer, { type Browser } from "puppeteer-core";
import JSZip from "jszip";
import { getSample, listSamples, getBiomTable, listReportsForSample } from "@/lib/store";
import { analyzeSample } from "@/lib/microbiome/engine";
import type { ReportType } from "@/lib/microbiome/types";

export function getChromeExecutablePath(): string | null {
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

  return null;
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
  if (!chromePath) {
    throw new Error("HEADLESS_CHROME_UNAVAILABLE_ON_SERVERLESS");
  }

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

  // If Chrome is unavailable on serverless environment (e.g. Vercel), generate standalone A4 HTML dossiers
  if (!chromePath) {
    const results: RenderedPdfItem[] = [];
    for (const sid of sampleIds) {
      const sample = await getSample(sid);
      if (!sample) continue;
      const biom = await getBiomTable(sid);
      const analysis = analyzeSample(sample, biom);
      const dbReports = await listReportsForSample(sid);
      const doctorRep = dbReports.find((r) => r.reportType === "doctor");

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MYGUTBIOME Report - ${sample.accession} (${sample.patientCode})</title>
  <style>
    @page { size: 210mm 297mm; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #143834; line-height: 1.5; padding: 24px; max-width: 900px; margin: 0 auto; background: #fafaf9; }
    .card { background: white; border: 1px solid #dcdfe4; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #1f4f4a; padding-bottom: 15px; margin-bottom: 20px; }
    .badge { display: inline-block; background: #e6f4f2; color: #1f4f4a; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; }
    .title { font-size: 24px; font-weight: bold; margin: 10px 0 5px; color: #143834; }
    .meta-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .meta-table td { padding: 8px 12px; border: 1px solid #e0e5e4; font-size: 13px; }
    .meta-table td.label { background: #f8faf9; font-weight: bold; width: 25%; color: #3d4c49; }
    .score-box { background: #f0f7f5; border: 1px solid #1f4f4a; border-radius: 10px; padding: 18px; margin: 20px 0; text-align: center; }
    .score { font-size: 40px; font-weight: bold; color: #143834; }
    .section-title { font-size: 16px; font-weight: bold; border-left: 4px solid #1f4f4a; padding-left: 10px; margin: 20px 0 12px; color: #143834; }
    .amr-alert { background: #fef2f2; border: 1px solid #f87171; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin: 10px 0; }
    @media print {
      body { padding: 0; background: white; }
      .card { border: none; box-shadow: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #143834; color: white; padding: 12px 18px; border-radius: 10px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <div><strong>ONEOMICS MYGUTBIOME</strong> Clinical Report Dossier (${sample.accession})</div>
    <button onclick="window.print()" style="background: #9a7b3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;">🖨️ Print / Save to A4 PDF</button>
  </div>
  <div class="card">
    <div class="header">
      <span class="badge">ONEOMICS · MYGUTBIOME CLINICAL DOSSIER</span>
      <div class="title">${sample.displayName} (${reportType.toUpperCase()} REPORT)</div>
      <div style="font-size: 13px; color: #5a6865;">Accession: <strong>${sample.accession}</strong> | MRN: <strong>${sample.patientCode}</strong> | Collection Date: ${sample.collectionDate}</div>
    </div>

    <table class="meta-table">
      <tr><td class="label">Patient Name</td><td>${sample.displayName}</td><td class="label">Sex / Age</td><td>${sample.sex} / ${sample.age} yrs</td></tr>
      <tr><td class="label">Clinical Indication</td><td>${sample.indication}</td><td class="label">Dietary Pattern</td><td>${sample.dietPattern}</td></tr>
      <tr><td class="label">Recent Antibiotics</td><td>${sample.recentAntibiotics ? "Yes" : "No"}</td><td class="label">Sign-Off Status</td><td>${doctorRep?.status === "signed_off" ? "Certified (" + (doctorRep?.signedOffBy || "") + ")" : "Pending Clinical Review"}</td></tr>
    </table>

    <div class="score-box">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #5a6865; font-weight: bold;">Gut Microbiome Health Score</div>
      <div class="score">${analysis.gutScore}/100</div>
      <div style="font-size: 13px; color: #1f4f4a; margin-top: 4px;">Shannon Diversity: <strong>${analysis.diversity.shannon.toFixed(2)}</strong> | F/B Ratio: <strong>${analysis.diversity.firmicutesBacteroidota ? analysis.diversity.firmicutesBacteroidota.toFixed(2) : "N/A"}</strong></div>
    </div>

    ${analysis.amr.length > 0 ? `
    <div class="section-title">Critical Antimicrobial Resistance (AMR) Findings</div>
    ${analysis.amr.map(a => `<div class="amr-alert"><strong>${a.gene}</strong> (${a.class}): ${a.interpretation} [Risk: ${a.level.toUpperCase()}]</div>`).join("")}
    ` : ""}

    <div class="section-title">Top Keystone Sentinels & Pathobionts</div>
    <table class="meta-table">
      <tr style="background:#f8faf9; font-weight:bold;"><td>Taxon</td><td>Relative Abundance</td><td>Classification</td></tr>
      ${analysis.beneficial.slice(0, 5).map(b => `<tr><td>${b.taxon}</td><td>${b.relativeAbundance}%</td><td style="color:#047857; font-weight:600;">Beneficial Sentinel</td></tr>`).join("")}
      ${analysis.pathogens.filter(p => p.relativeAbundance > 0).map(p => `<tr><td>${p.taxon}</td><td>${p.relativeAbundance}%</td><td style="color:#b91c1c; font-weight:600;">Pathobiont / Pathogen</td></tr>`).join("")}
    </table>

    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e5e4; font-size: 11px; color: #7a8885; text-align: center;">
      ONEOMICS MYGUTBIOME · Clinical Metagenomic Report · Generated on ${new Date().toISOString().slice(0, 10)}
    </div>
  </div>
</body>
</html>`;

      results.push({
        sampleId: sid,
        accession: sample.accession,
        patientCode: sample.patientCode,
        filename: `MYGUTBIOME_${sample.accession}_${sample.patientCode}_${reportType.toUpperCase()}_REPORT.html`,
        buffer: Buffer.from(htmlContent, "utf-8"),
      });
    }
    return results;
  }

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
