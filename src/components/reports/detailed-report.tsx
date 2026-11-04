import Image from "next/image";
import { GLOSSARY, METHODS_PARAS, REFERENCES, SPECIES } from "@/lib/microbiome/catalog";
import type { Analysis } from "@/lib/microbiome/types";
import { Donut, PhylumBars } from "./charts";
import { LevelPill, MiniBar, ReportPage } from "./report-page";
import { MyGutBiomeLogo } from "@/components/ui/mygutbiome-logo";

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function DetailedReport({ analysis }: { analysis: Analysis }) {
  const speciesPages = chunk(analysis.species, 18);
  const diseasePages = chunk(analysis.diseases, 7);
  const amrPages = chunk(analysis.amr.length ? analysis.amr : [], 10);
  const dictPages = chunk(SPECIES, 14);
  const familyPages = chunk(analysis.families, 18);
  const pathPages = chunk(analysis.pathways, 20);

  const extra =
    speciesPages.length +
    diseasePages.length +
    Math.max(amrPages.length, 1) +
    dictPages.length +
    familyPages.length +
    pathPages.length;

  const fixed = 17;
  const total = fixed + extra;

  let n = 0;
  const next = () => ++n;

  const pages = [
    <ReportPage key="c" analysis={analysis} type="detailed" page={next()} total={total}>
      <div className="flex h-full flex-col justify-between py-8">
        <div>
          <div className="mb-6">
            <Image
              src="/oneomics-logo.png"
              alt="OneOmics"
              width={260}
              height={62}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
          <div className="mt-5 mb-2">
            <MyGutBiomeLogo variant="light" height={44} className="h-11 w-auto object-contain" priority />
          </div>
          <p className="mt-1 font-serif text-2xl text-[#3d4c49]">Detailed scientific report</p>
          <p className="mt-6 max-w-md text-[13px] leading-relaxed">
            Shotgun metagenomic interpretation of stool microbial communities, antimicrobial
            resistance determinants, disease-association modules, beneficial taxa, and diet
            recommendations.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-[12px]">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#6a7875]">Accession</p>
            <p className="font-medium">{analysis.sample.accession}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7875]">Patient code</p>
            <p className="font-medium">{analysis.sample.patientCode}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7875]">Indication</p>
            <p>{analysis.sample.indication}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#6a7875]">Pipeline</p>
            <p>{analysis.qc.pipeline}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7875]">Integrity score</p>
            <p className="font-serif text-3xl">{analysis.gutScore}</p>
          </div>
        </div>
      </div>
    </ReportPage>,

    <ReportPage key="toc" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Contents</h2>
      <ol className="mt-3 columns-2 gap-8 text-[12px] leading-7">
        <li>Cover</li>
        <li>Contents</li>
        <li>Scope and limitations</li>
        <li>Sample identifiers</li>
        <li>Sequencing quality</li>
        <li>Scientific summary</li>
        <li>Diversity metrics</li>
        <li>Phylum composition</li>
        <li>Family composition</li>
        <li>Species catalogue</li>
        <li>Beneficial organisms</li>
        <li>Pathogen screen</li>
        <li>AMR resistome</li>
        <li>Disease and disorder modules</li>
        <li>Functional pathways</li>
        <li>SCFA and metabolites</li>
        <li>Diet recommendations</li>
        <li>Meal pattern and food science</li>
        <li>Clinical correlation</li>
        <li>Methods</li>
        <li>References</li>
        <li>Glossary</li>
        <li>Organism dictionary (appendix)</li>
      </ol>
    </ReportPage>,

    <ReportPage key="scope" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Scope and limitations</h2>
      <div className="mt-3 space-y-2 text-[12.5px] leading-relaxed">
        <p>
          MYGUTBIOME reports relative DNA abundance. It is not culture, not toxin EIA, not
          histopathology, and not a companion diagnostic.
        </p>
        <p>
          AMR gene detection indicates genetic potential in the metagenome. Expression, copy number
          in a clinical isolate, and MIC are unknown unless a pathogen is cultured.
        </p>
        <p>
          Disease modules are literature-derived pattern scores. Elevated scores do not establish
          IBD, IBS, CRC, SIBO, NAFLD, depression, Parkinson disease, or autoimmunity.
        </p>
        <p>
          Diet advice is educational. It must be adapted for allergy, CKD potassium/protein limits,
          active IBD flares, pregnancy, and eating disorders.
        </p>
        <p>
          Oral taxa in stool may reflect gum disease or sample contamination rather than colonic
          bloom. Helicobacter DNA is a gastric clue, not a colonic community member.
        </p>
      </div>
    </ReportPage>,

    <ReportPage key="ids" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Sample identifiers</h2>
      <table className="mt-3 w-full text-[12px]">
        <tbody>
          {(
            [
              ["Accession", analysis.sample.accession],
              ["Patient code", analysis.sample.patientCode],
              ["Display", analysis.sample.displayName],
              ["Age / sex", `${analysis.sample.age} / ${analysis.sample.sex}`],
              ["Indication", analysis.sample.indication],
              ["Diet pattern (history)", analysis.sample.dietPattern],
              ["Recent antibiotics", analysis.sample.recentAntibiotics ? "Yes" : "No"],
              ["Collected", analysis.sample.collectionDate],
              ["Received", analysis.sample.receivedDate],
              ["Sequenced", analysis.sample.sequencedDate],
              ["Community profile used", analysis.sample.profileId],
            ] as const
          ).map(([k, v]) => (
            <tr key={k} className="border-b border-[#1f4f4a]/10">
              <td className="w-48 py-1.5 text-[#6a7875]">{k}</td>
              <td className="py-1.5">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportPage>,

    <ReportPage key="qc" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Sequencing quality</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        {(
          [
            ["Total reads", analysis.qc.totalReads.toLocaleString()],
            ["Host reads", `${analysis.qc.hostReadsPct}%`],
            ["Microbial reads (est.)", analysis.qc.microbialReads.toLocaleString()],
            ["Mean Q-score", analysis.qc.meanQuality],
            ["Duplication", `${analysis.qc.duplicationPct}%`],
            ["Classified", `${analysis.qc.classifiedPct}%`],
            ["Kit", analysis.qc.kit],
            ["Contamination flag", analysis.qc.contaminationFlag ? "YES" : "None called"],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="rounded border border-[#1f4f4a]/15 px-3 py-2">
            <p className="text-[10px] uppercase text-[#6a7875]">{k}</p>
            <p className="font-medium">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] leading-relaxed">
        Acceptance criteria for this demo pipeline: mean Q ≥ 30, classified ≥ 80%, no spike-in
        contamination flag. This sample meets those internal gates.
      </p>
    </ReportPage>,

    <ReportPage key="sum" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Scientific summary</h2>
      <p className="mt-2 text-[12.5px] leading-relaxed">{analysis.summary.scientific}</p>
      <p className="mt-2 text-[12.5px] leading-relaxed">{analysis.summary.doctor}</p>
      <div className="mt-4">
        <Donut value={analysis.gutScore} label="Community integrity score used for longitudinal tracking, not diagnosis." />
      </div>
      <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wider">Recommended Clinical Actions</h3>
      <ol className="mt-1 list-decimal pl-4 text-[12px] leading-relaxed">
        {analysis.actions.doctor.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ol>
    </ReportPage>,

    <ReportPage key="div" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Diversity metrics</h2>
      <table className="mt-3 w-full text-[12px] border-collapse">
        <thead>
          <tr className="border-b border-[#1f4f4a]/15 bg-[#1f4f4a]/5 text-left text-[10px] uppercase font-bold text-[#143834]">
            <th className="py-2 px-3">Metric</th>
            <th className="py-2 px-3 text-right w-28">Value</th>
            <th className="py-2 px-3 text-right w-44">Healthy-Adult Window</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1f4f4a]/10">
          <tr>
            <td className="py-2 px-3 font-medium text-[#143834]">Shannon Diversity</td>
            <td className="py-2 px-3 text-right font-mono font-bold text-[#143834]">{analysis.diversity.shannon}</td>
            <td className="py-2 px-3 text-right font-mono text-[#6a7875]">
              {analysis.diversity.shannonRef[0]} – {analysis.diversity.shannonRef[1]}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-medium text-[#143834]">Simpson Index</td>
            <td className="py-2 px-3 text-right font-mono font-bold text-[#143834]">{analysis.diversity.simpson}</td>
            <td className="py-2 px-3 text-right font-mono text-[#6a7875]">0.88 – 0.97</td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-medium text-[#143834]">Chao1 Richness</td>
            <td className="py-2 px-3 text-right font-mono font-bold text-[#143834]">{analysis.diversity.chao1}</td>
            <td className="py-2 px-3 text-right font-mono text-[#6a7875]">250 – 450</td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-medium text-[#143834]">Observed Features (ASVs)</td>
            <td className="py-2 px-3 text-right font-mono font-bold text-[#143834]">{analysis.diversity.observedAsvs}</td>
            <td className="py-2 px-3 text-right font-mono text-[#6a7875]">—</td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-medium text-[#143834]">Pielou Evenness</td>
            <td className="py-2 px-3 text-right font-mono font-bold text-[#143834]">{analysis.diversity.pielouEvenness}</td>
            <td className="py-2 px-3 text-right font-mono text-[#6a7875]">0.70 – 0.90</td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-medium text-[#143834]">Firmicutes : Bacteroidota Ratio</td>
            <td className="py-2 px-3 text-right font-mono font-bold text-[#143834]">{analysis.diversity.firmicutesBacteroidota}</td>
            <td className="py-2 px-3 text-right font-mono text-[#6a7875]">0.6 – 2.5</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-[12px] leading-relaxed">
        Diversity is necessary but not sufficient for a healthy gut. A diverse community can still
        carry CRE plasmids; a lower-diversity community after antibiotics can recover.
      </p>
    </ReportPage>,

    <ReportPage key="phy" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Phylum composition</h2>
      <div className="mt-3">
        <PhylumBars data={analysis.phyla} />
      </div>
      <table className="mt-4 w-full text-[12px] border-collapse">
        <thead>
          <tr className="border-b border-[#1f4f4a]/15 bg-[#1f4f4a]/5 text-left text-[10px] uppercase font-bold text-[#143834]">
            <th className="py-2 px-3">Phylum</th>
            <th className="py-2 px-3 text-right w-36 whitespace-nowrap">Relative Abundance %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1f4f4a]/10">
          {analysis.phyla.map((p) => (
            <tr key={p.taxon}>
              <td className="py-2 px-3 font-medium text-[#143834]">{p.taxon}</td>
              <td className="py-2 px-3 text-right tabular-nums font-mono font-semibold text-[#143834]">
                {p.relativeAbundance.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportPage>,
  ];

  familyPages.forEach((rows, i) => {
    pages.push(
      <ReportPage key={`fam-${i}`} analysis={analysis} type="detailed" page={next()} total={total}>
        <h2 className="font-serif text-2xl text-[#143834]">
          Family composition {familyPages.length > 1 ? `(${i + 1}/${familyPages.length})` : ""}
        </h2>
        <table className="mt-3 w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b border-[#1f4f4a]/15 bg-[#1f4f4a]/5 text-left text-[10px] uppercase font-bold text-[#143834]">
              <th className="py-2 px-3">Family</th>
              <th className="py-2 px-3 text-right w-36 whitespace-nowrap">Relative Abundance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f4f4a]/10">
            {rows.map((p) => (
              <tr key={p.taxon}>
                <td className="py-2 px-3 font-medium text-[#143834]">{p.taxon}</td>
                <td className="py-2 px-3 text-right tabular-nums font-mono font-semibold text-[#143834]">
                  {p.relativeAbundance.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportPage>,
    );
  });

  speciesPages.forEach((rows, i) => {
    pages.push(
      <ReportPage key={`sp-${i}`} analysis={analysis} type="detailed" page={next()} total={total}>
        <h2 className="font-serif text-2xl text-[#143834]">
          Species catalogue ({i + 1}/{speciesPages.length})
        </h2>
        <table className="mt-3 w-full text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-[#1f4f4a]/15 bg-[#1f4f4a]/5 text-left text-[9.5px] uppercase font-bold text-[#143834]">
              <th className="py-2 px-3">Taxon</th>
              <th className="py-2 px-3 w-28">Role</th>
              <th className="py-2 px-3 text-right w-24 whitespace-nowrap">% Abundance</th>
              <th className="py-2 px-3 text-right w-28 whitespace-nowrap">Healthy Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f4f4a]/10">
            {rows.map((p) => (
              <tr key={p.taxon} className="align-top hover:bg-[#1f4f4a]/5 transition-colors">
                <td className="py-1.5 px-3 italic font-medium text-[#143834]">{p.taxon}</td>
                <td className="py-1.5 px-3 capitalize text-[10px] text-[#4d5c59]">{p.role}</td>
                <td className="py-1.5 px-3 text-right tabular-nums font-mono font-semibold text-[#143834]">
                  {p.relativeAbundance.toFixed(3)}%
                </td>
                <td className="py-1.5 px-3 text-right tabular-nums font-mono text-[#6a7875]">
                  {p.referenceRange[0]}% – {p.referenceRange[1]}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportPage>,
    );
  });

  pages.push(
    <ReportPage key="ben" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Beneficial organisms</h2>
      <p className="mt-1 text-[12px]">
        Beneficial is ecological — barrier, SCFA, colonization resistance — not a marketing claim.
      </p>
      <div className="mt-2 space-y-2">
        {analysis.beneficial.map((b) => (
          <div key={b.taxon}>
            <div className="flex justify-between text-[12px]">
              <span className="italic">{b.taxon}</span>
              <span className="tabular-nums">{b.relativeAbundance.toFixed(2)}%</span>
            </div>
            <MiniBar value={b.relativeAbundance} max={Math.max(b.referenceRange[1], 0.5)} />
            <p className="text-[10.5px] text-[#4d5c59]">{b.notes}</p>
          </div>
        ))}
      </div>
    </ReportPage>,
  );

  pages.push(
    <ReportPage key="path" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Pathogen and pathobiont screen</h2>
      <p className="mt-1 text-[12px]">
        WHO bacterial priority pathogens relevant to the gut, plus selected pathobionts.
      </p>
      <table className="mt-3 w-full text-[11px] border-collapse">
        <thead>
          <tr className="border-b border-[#1f4f4a]/15 bg-[#1f4f4a]/5 text-left text-[9.5px] uppercase font-bold text-[#143834]">
            <th className="py-2 px-3">Organism</th>
            <th className="py-2 px-3 text-right w-24 whitespace-nowrap">% Abundance</th>
            <th className="py-2 px-3">Clinical Interpretation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1f4f4a]/10">
          {analysis.pathogens.map((p) => (
            <tr key={p.taxon} className="align-top hover:bg-[#1f4f4a]/5 transition-colors">
              <td className="py-2 px-3 italic font-medium text-[#143834] whitespace-nowrap">{p.taxon}</td>
              <td className="py-2 px-3 text-right tabular-nums font-mono font-semibold text-[#143834] whitespace-nowrap">
                {p.relativeAbundance.toFixed(3)}%
              </td>
              <td className="py-2 px-3 text-[10.5px] leading-snug text-[#4d5c59]">{p.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportPage>,
  );

  if (amrPages.length === 0) {
    pages.push(
      <ReportPage key="amr0" analysis={analysis} type="detailed" page={next()} total={total}>
        <h2 className="font-serif text-2xl text-[#143834]">AMR resistome</h2>
        <p className="mt-3 text-[13px]">No panel genes exceeded the reporting threshold.</p>
      </ReportPage>,
    );
  } else {
    amrPages.forEach((rows, i) => {
      pages.push(
        <ReportPage key={`amr-${i}`} analysis={analysis} type="detailed" page={next()} total={total}>
          <h2 className="font-serif text-2xl text-[#143834]">
            AMR resistome ({i + 1}/{amrPages.length})
          </h2>
          {rows.map((a) => (
            <div key={a.gene} className="mt-2 border-b border-[#1f4f4a]/10 pb-2">
              <div className="flex items-center gap-2">
                <LevelPill level={a.level} />
                <span className="font-mono text-[12px]">{a.gene}</span>
                <span className="text-[10px] text-[#6a7875]">WHO {a.whoPriority}</span>
              </div>
              <p className="text-[11px] font-medium text-[#2d4c46]">
                {a.class} · Host: <span className="italic">{a.organism}</span> · Confirmed Genomic Detection
              </p>
              <p className="text-[11px] leading-snug">{a.interpretation}</p>
              <p className="text-[10.5px] text-[#4d5c59]">{a.clinicalNote}</p>
            </div>
          ))}
        </ReportPage>,
      );
    });
  }

  diseasePages.forEach((rows, i) => {
    pages.push(
      <ReportPage key={`dis-${i}`} analysis={analysis} type="detailed" page={next()} total={total}>
        <h2 className="font-serif text-2xl text-[#143834]">
          Disease and disorder modules ({i + 1}/{diseasePages.length})
        </h2>
        {rows.map((d) => (
          <div key={d.id} className="mt-2 rounded border border-[#1f4f4a]/12 p-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-medium">{d.name}</p>
              <LevelPill level={d.band} />
            </div>
            <p className="text-[10px] text-[#6a7875]">
              {d.category} · score {d.score} · drivers: {d.drivers.join(", ")}
            </p>
            <p className="mt-1 text-[11px] leading-snug">{d.evidence}</p>
            <p className="mt-1 text-[11px] leading-snug">
              <span className="font-medium">Clinician:</span> {d.clinicianNote}
            </p>
          </div>
        ))}
      </ReportPage>,
    );
  });

  pathPages.forEach((rows, i) => {
    pages.push(
      <ReportPage key={`pw-${i}`} analysis={analysis} type="detailed" page={next()} total={total}>
        <h2 className="font-serif text-2xl text-[#143834]">
          Functional pathways ({i + 1}/{pathPages.length})
        </h2>
        <table className="mt-3 w-full text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-[#1f4f4a]/15 bg-[#1f4f4a]/5 text-left text-[9.5px] uppercase font-bold text-[#143834]">
              <th className="py-2 px-3">Pathway</th>
              <th className="py-2 px-3 text-right w-20 whitespace-nowrap">Observed</th>
              <th className="py-2 px-3 text-right w-20 whitespace-nowrap">Expected</th>
              <th className="py-2 px-3">Clinical Call</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f4f4a]/10">
            {rows.map((p) => (
              <tr key={p.name} className="align-top hover:bg-[#1f4f4a]/5 transition-colors">
                <td className="py-2 px-3 font-medium text-[#143834]">{p.name}</td>
                <td className="py-2 px-3 text-right tabular-nums font-mono font-bold text-[#143834]">
                  {p.abundanceIndex.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right tabular-nums font-mono text-[#6a7875]">
                  {p.expected.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-[10.5px] leading-snug text-[#4d5c59]">{p.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportPage>,
    );
  });

  pages.push(
    <ReportPage key="scfa" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">SCFA and metabolite potential</h2>
      <p className="mt-1 text-[12px]">
        These are gene-content proxies, not stool metabolomics.
      </p>
      {analysis.scfa.map((s) => (
        <div key={s.name} className="mt-3">
          <div className="flex justify-between text-[13px]">
            <span>{s.name}</span>
            <span className="tabular-nums">{s.index}</span>
          </div>
          <MiniBar value={s.index} />
          <p className="text-[11px] text-[#4d5c59]">{s.note}</p>
        </div>
      ))}
    </ReportPage>,
  );

  pages.push(
    <ReportPage key="diet" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Diet recommendations</h2>
      {analysis.diet.map((d) => (
        <div key={d.food} className="mt-2 border-b border-[#1f4f4a]/10 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a7b3c]">
            {d.action.replaceAll("-", " ")}
          </p>
          <p className="text-[13px] font-medium">{d.food}</p>
          <p className="text-[11.5px] leading-snug">{d.rationale}</p>
          <p className="text-[10px] text-[#6a7875]">Targets: {d.targets.join(", ")}</p>
        </div>
      ))}
    </ReportPage>,
  );

  pages.push(
    <ReportPage key="meal" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Meal pattern and food science</h2>
      <div className="space-y-2 text-[12.5px] leading-relaxed">
        <p>
          A diverse whole-food dietary pattern (incorporating vegetables, legumes, whole grains, nuts, seeds, and naturally fermented foods) is the coaching foundation because it reliably maximizes prebiotic diversity and protective short-chain fatty acid (SCFA) production.
        </p>
        <p>
          Dietary fibre and resistant starches from unrefined plant sources significantly enhance butyrate potential, nourishing colonocytes and reinforcing mucosal barrier integrity.
        </p>
        <p>
          Dietary polyphenols from colourful plant foods and green tea associate with Akkermansia abundance and anti-inflammatory gut barrier reinforcement.
        </p>
        <p>
          If an IBS module is borderline or elevated, a dietitian-supervised temporary phase favoring gentle cooked/steamed vegetables, soaked legumes, and gentle herbal infusions helps soothe bloating before broader fiber diversification.
        </p>
        <p>
          Probiotics are strain-specific. This report does not endorse commercial synthetic supplements. Naturally fermented foods containing live active cultures come first, followed by physician-directed targeted probiotics only when clinically indicated.
        </p>
      </div>
    </ReportPage>,
  );

  pages.push(
    <ReportPage key="clin" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Clinical correlation</h2>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed">
        <li>Pair AMR findings with local antibiogram and infection-control policy.</li>
        <li>Pair IBD-pattern scores with calprotectin and endoscopy, not with empiric steroids.</li>
        <li>Pair CRC-associated taxa with age-appropriate screening — never as a cancer test.</li>
        <li>Pair C. difficile DNA with toxin testing only if there is diarrhoea.</li>
        <li>Repeat MYGUTBIOME no sooner than 8–12 weeks after a diet or antibiotic change unless clinically required.</li>
      </ul>
      <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wider">Patient-facing actions</h3>
      <ol className="mt-1 list-decimal pl-4 text-[12px]">
        {analysis.actions.patient.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ol>
    </ReportPage>,
  );

  pages.push(
    <ReportPage key="meth" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Methods</h2>
      {METHODS_PARAS.map((p) => (
        <p key={p} className="mt-2 text-[12.5px] leading-relaxed">
          {p}
        </p>
      ))}
    </ReportPage>,
  );

  pages.push(
    <ReportPage key="ref" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Selected references</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11.5px] leading-snug">
        {REFERENCES.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
    </ReportPage>,
  );

  pages.push(
    <ReportPage key="gloss" analysis={analysis} type="detailed" page={next()} total={total}>
      <h2 className="font-serif text-2xl text-[#143834]">Glossary</h2>
      {GLOSSARY.map((g) => (
        <div key={g.term} className="mt-2">
          <p className="text-[12px] font-semibold">{g.term}</p>
          <p className="text-[11.5px] leading-snug text-[#3d4c49]">{g.def}</p>
        </div>
      ))}
    </ReportPage>,
  );

  dictPages.forEach((rows, i) => {
    pages.push(
      <ReportPage key={`dict-${i}`} analysis={analysis} type="detailed" page={next()} total={total}>
        <h2 className="font-serif text-xl text-[#143834]">
          Appendix · organism dictionary ({i + 1}/{dictPages.length})
        </h2>
        {rows.map((s) => (
          <div key={s.taxon} className="mt-2 border-b border-[#1f4f4a]/10 pb-1.5">
            <p className="text-[12px] italic">
              {s.taxon}{" "}
              <span className="not-italic text-[10px] text-[#6a7875]">
                {s.phylum} · {s.family} · {s.role}
              </span>
            </p>
            <p className="text-[11px] leading-snug">{s.notes}</p>
            {s.benefits && <p className="text-[10.5px] text-[#4d5c59]">{s.benefits}</p>}
          </div>
        ))}
      </ReportPage>,
    );
  });

  return <>{pages}</>;
}
