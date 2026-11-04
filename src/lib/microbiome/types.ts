export type ReportType = "doctor" | "patient" | "detailed";

export type Sex = "female" | "male" | "unspecified";

export type AlertLevel = "critical" | "high" | "moderate" | "low" | "info";

export type SampleProfileId =
  | "dysbiosis-amr"
  | "healthy"
  | "metabolic"
  | "post-antibiotic"
  | "biom-upload";

export type SampleSource = "demo" | "biom";

export type SampleInput = {
  id: string;
  accession: string;
  patientCode: string;
  displayName: string;
  age: number;
  sex: Sex;
  indication: string;
  collectionDate: string;
  receivedDate: string;
  sequencedDate: string;
  profileId: SampleProfileId;
  source: SampleSource;
  notes?: string;
  recentAntibiotics: boolean;
  dietPattern: string;
  createdAt: string;
  biomFileName?: string;
  biomSampleId?: string;
  biomFormat?: string;
  biomFeatureCount?: number;
};

export type BiomObservation = {
  id: string;
  taxon: string;
  taxonomy: string[];
  phylum: string;
  family: string;
  genus: string;
  count: number;
  relativeAbundance: number;
};

export type PreFlightQcMetrics = {
  formatType: "biom_json" | "biom_hdf5" | "tsv_table" | "fastq";
  meanQScore: number;
  q30Percentage: number;
  hostDepletionPercentage: number;
  classifiedPercentage: number;
  totalRawReads: number;
  averageReadLength?: number;
  gcContentPercentage?: number;
  qcStatus: "pass" | "warn" | "fail";
  qcSummary: string;
  hostReadsCount?: number;
  classifiedReadsCount?: number;
};

export type SampleTaxaPreview = {
  sampleId: string;
  topTaxa: {
    taxon: string;
    phylum: string;
    family: string;
    relativeAbundance: number;
    count: number;
    role: "beneficial" | "harmful" | "commensal";
    clinicalTag?: string;
  }[];
  phyla: {
    phylum: string;
    percentage: number;
    color: string;
  }[];
  signals: {
    type: "positive" | "warning" | "info";
    title: string;
    description: string;
  }[];
  fbRatio?: number;
};

export type BiomTablePreview = {
  format: string;
  generatedBy: string;
  date: string;
  featureCount: number;
  sampleIds: string[];
  taxonomyPresent: boolean;
  matrixType: string;
  totalCounts: Record<string, number>;
  matrixSparsityPercentage?: number;
  qcMetrics?: PreFlightQcMetrics;
  sampleTaxaPreviews?: Record<string, SampleTaxaPreview>;
};

export type BiomColumnData = {
  sampleId: string;
  fileName: string;
  format: string;
  generatedBy: string;
  observations: BiomObservation[];
  totalCount: number;
  assignedCount: number;
};

export type OrganismHit = {
  taxon: string;
  rank: "phylum" | "family" | "genus" | "species";
  relativeAbundance: number;
  referenceRange: [number, number];
  role: "beneficial" | "commensal" | "opportunistic" | "pathogen";
  notes: string;
  phylum: string;
  family: string;
};

export type AmrFinding = {
  organism: string;
  gene: string;
  class: string;
  whoPriority: "critical" | "high" | "medium";
  reads: number;
  coverage: number;
  interpretation: string;
  clinicalNote: string;
  level: AlertLevel;
};

export type DiseaseScore = {
  id: string;
  name: string;
  category: string;
  score: number;
  band: "elevated" | "borderline" | "typical";
  drivers: string[];
  evidence: string;
  clinicianNote: string;
  patientNote: string;
};

export type DietItem = {
  food: string;
  action: "emphasize" | "include" | "limit" | "avoid-if-symptomatic";
  rationale: string;
  targets: string[];
};

export type PathwayHit = {
  name: string;
  abundanceIndex: number;
  expected: number;
  interpretation: string;
};

export type QcMetrics = {
  totalReads: number;
  hostReadsPct: number;
  microbialReads: number;
  meanQuality: number;
  duplicationPct: number;
  classifiedPct: number;
  contaminationFlag: boolean;
  kit: string;
  pipeline: string;
};

export type DiversityMetrics = {
  shannon: number;
  shannonRef: [number, number];
  simpson: number;
  chao1: number;
  observedAsvs: number;
  pielouEvenness: number;
  firmicutesBacteroidota: number;
};

export type GmhiScore = {
  score: number;
  status: "healthy-like" | "non-healthy-like" | "neutral";
  psiHealthy: number;
  psiNonHealthy: number;
  healthySpeciesFound: number;
  nonHealthySpeciesFound: number;
  reference: string;
};

export type Analysis = {
  sample: SampleInput;
  generatedAt: string;
  lab: {
    name: string;
    product: string;
    site: string;
    director: string;
    accreditation: string;
  };
  qc: QcMetrics;
  diversity: DiversityMetrics;
  phyla: OrganismHit[];
  families: OrganismHit[];
  species: OrganismHit[];
  beneficial: OrganismHit[];
  pathogens: OrganismHit[];
  amr: AmrFinding[];
  diseases: DiseaseScore[];
  pathways: PathwayHit[];
  scfa: { name: string; index: number; note: string }[];
  diet: DietItem[];
  summary: {
    doctor: string;
    patient: string;
    scientific: string;
  };
  actions: {
    doctor: string[];
    patient: string[];
  };
  gmhi: GmhiScore;
  gutScore: number;
};
