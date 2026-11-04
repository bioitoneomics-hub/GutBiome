# MYGUTBIOME · ONEOMICS

Generate gut microbiome reports from accessioned stool samples:

- **Doctor-centric** (1–2 pages) — clinical synopsis, AMR genes, pathogen screen, disease-pattern scores, diet and stewardship actions
- **Patient-centric** (1–5 pages) — gut score, beneficial organisms, plain-language AMR, condition context, food plan
- **Detailed scientific** (1–30 pages) — QC, taxonomy, resistome, functional pathways, evidence tables, methods, references, organism dictionary

Coverage includes WHO-priority AMR pathogens and genes, IBD/IBS/metabolic/CRC-adjacent and other disorder modules, beneficial taxa (e.g. *Faecalibacterium*, *Akkermansia*, bifidobacteria), and diet recommendations.

This is a **research-style demo**. It is not a medical device, not a diagnosis, and not a prescription.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123). Upload a BIOM table at `/upload` (example file at `/examples/example-gut.biom`).

Print any report (or save as PDF) from the report toolbar. `/reports/:id/all` prints doctor + patient + detailed together.

## HTTP API

| Endpoint | Description |
| --- | --- |
| `GET /api/catalog` | Report types, community profiles, panel sizes |
| `POST /api/biom/preview` | Parse BIOM 1.0 JSON (or OTU TSV); returns sample columns |
| `POST /api/biom/process` | Accession a BIOM column and generate doctor, patient, and detailed reports |
| `GET /api/samples` | Accessioned samples |
| `POST /api/samples` | Create a demo sample (`displayName`, `age`, `sex`, `indication`, `profileId`, `recentAntibiotics`, `dietPattern`) |
| `GET /api/samples/:id` | One sample |
| `GET /api/analysis/:id?type=doctor\|patient\|detailed` | Full analysis JSON used to render reports |

Community `profileId` values: `dysbiosis-amr`, `healthy`, `metabolic`, `post-antibiotic`.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui. Analysis runs in a server-side engine (`src/lib/microbiome`).
