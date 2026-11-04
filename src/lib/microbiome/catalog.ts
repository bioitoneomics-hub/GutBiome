export const LAB = {
  name: "ONEOMICS",
  product: "MYGUTBIOME",
  site: "Clinical Genomics Laboratory",
  director: "Laboratory Director, ONEOMICS",
  accreditation: "ISO 15189 research-use workflow (demo)",
};

export const PHYLA = [
  "Firmicutes",
  "Bacteroidota",
  "Actinobacteriota",
  "Proteobacteria",
  "Verrucomicrobiota",
  "Fusobacteriota",
  "Euryarchaeota",
] as const;

export const FAMILIES = [
  "Lachnospiraceae",
  "Ruminococcaceae",
  "Oscillospiraceae",
  "Bacteroidaceae",
  "Prevotellaceae",
  "Rikenellaceae",
  "Bifidobacteriaceae",
  "Lactobacillaceae",
  "Enterobacteriaceae",
  "Enterococcaceae",
  "Clostridiaceae",
  "Akkermansiaceae",
  "Veillonellaceae",
  "Streptococcaceae",
  "Peptostreptococcaceae",
  "Desulfovibrionaceae",
  "Fusobacteriaceae",
  "Methanobacteriaceae",
] as const;

export type SpeciesDef = {
  taxon: string;
  family: string;
  phylum: string;
  role: "beneficial" | "commensal" | "opportunistic" | "pathogen";
  ref: [number, number];
  notes: string;
  benefits?: string;
};

export const SPECIES: SpeciesDef[] = [
  {
    taxon: "Faecalibacterium prausnitzii",
    family: "Oscillospiraceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [3, 12],
    notes: "A cornerstone friendly bacterium. It produces butyrate (natural fuel for your gut cells) that soothes inflammation and keeps digestion smooth.",
    benefits: "Feeds your gut lining, calms inflammation, and strengthens daily digestive comfort.",
  },
  {
    taxon: "Akkermansia muciniphila",
    family: "Akkermansiaceae",
    phylum: "Verrucomicrobiota",
    role: "beneficial",
    ref: [0.5, 4],
    notes: "A protective guardian microbe. It maintains the gut's natural mucus shield and helps regulate blood sugar and metabolism.",
    benefits: "Protects the gut barrier and supports healthy metabolism and weight balance.",
  },
  {
    taxon: "Bifidobacterium longum",
    family: "Bifidobacteriaceae",
    phylum: "Actinobacteriota",
    role: "beneficial",
    ref: [0.4, 6],
    notes: "A gentle friendly probiotic bacteria from birth. It breaks down dietary fibers and produces soothing acids that feed other good microbes.",
    benefits: "Helps prevent gas, promotes comfortable and regular bowel movements, and supports immunity.",
  },
  {
    taxon: "Bifidobacterium adolescentis",
    family: "Bifidobacteriaceae",
    phylum: "Actinobacteriota",
    role: "beneficial",
    ref: [0.2, 4],
    notes: "A key adult probiotic that thrives on traditional whole grains, millets, dals, and plant fibers.",
    benefits: "Produces natural B-vitamins and friendly acids to nourish the digestive tract.",
  },
  {
    taxon: "Bifidobacterium bifidum",
    family: "Bifidobacteriaceae",
    phylum: "Actinobacteriota",
    role: "beneficial",
    ref: [0.05, 2],
    notes: "Helps reinforce the gut's inner lining. It is sensitive to antibiotics and can be rebuilt with prebiotic foods.",
    benefits: "Supports gut barrier defense and natural recovery after medications.",
  },
  {
    taxon: "Roseburia intestinalis",
    family: "Lachnospiraceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [0.5, 5],
    notes: "A master fermenter that turns dietary fiber from lentils, millets, cooled rice, and seeds into nourishing short-chain fatty acids.",
    benefits: "Keeps the colon energized, healthy, and resilient against irritation.",
  },
  {
    taxon: "Roseburia hominis",
    family: "Lachnospiraceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [0.2, 3],
    notes: "An active helper bacteria that communicates with your immune cells to promote calm, balanced digestion.",
    benefits: "Helps train the immune system not to overreact to everyday foods.",
  },
  {
    taxon: "Eubacterium rectale",
    family: "Lachnospiraceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [0.8, 8],
    notes: "One of the most abundant friendly bacteria in healthy adults. It flourishes when you eat plenty of colorful vegetables and fiber.",
    benefits: "Powers the lower digestive tract and keeps stool form healthy and soft.",
  },
  {
    taxon: "Anaerobutyricum hallii",
    family: "Lachnospiraceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [0.2, 3],
    notes: "A team player that cleans up lactic acid produced during digestion and converts it into healing butyrate.",
    benefits: "Balances gut acidity and prevents stomach discomfort.",
  },
  {
    taxon: "Coprococcus eutactus",
    family: "Lachnospiraceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [0.1, 2],
    notes: "Produces feel-good gut signals that communicate with the nervous system via the gut–brain connection.",
    benefits: "Linked to positive mood, energy levels, and lower digestive sensitivity.",
  },
  {
    taxon: "Christensenella minuta",
    family: "Christensenellaceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [0.01, 0.8],
    notes: "A naturally occurring helper microbe strongly associated with healthy metabolic rate and a lean body composition.",
    benefits: "Supports natural fat metabolism and long-term metabolic vitality.",
  },
  {
    taxon: "Blautia wexlerae",
    family: "Lachnospiraceae",
    phylum: "Firmicutes",
    role: "commensal",
    ref: [0.5, 6],
    notes: "A common, peaceful resident of the gut that helps break down complex carbohydrates.",
    benefits: "Assists in everyday digestion and peaceful microbial balance.",
  },
  {
    taxon: "Lacticaseibacillus rhamnosus",
    family: "Lactobacillaceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [0.01, 1.5],
    notes: "A well-known probiotic organism found in traditional curd (dahi) and cultured milk that supports gut immunity.",
    benefits: "Helps calm temporary stomach upset, diarrhea, and antibiotic side effects.",
  },
  {
    taxon: "Lactiplantibacillus plantarum",
    family: "Lactobacillaceae",
    phylum: "Firmicutes",
    role: "beneficial",
    ref: [0.01, 1],
    notes: "A rugged friendly lactic acid bacteria found in naturally fermented foods (dahi, idli/dosa batter, fermented pickles, and kanji).",
    benefits: "Crowds out unwanted bacteria and supports healthy nutrient absorption.",
  },
  {
    taxon: "Bacteroides thetaiotaomicron",
    family: "Bacteroidaceae",
    phylum: "Bacteroidota",
    role: "commensal",
    ref: [1, 8],
    notes: "The workhorse of dietary fiber digestion. It possesses hundreds of enzymes to digest complex plants and grains.",
    benefits: "Unlocks nutrients and vitamins from fruits, vegetables, and complex carbohydrates.",
  },
  {
    taxon: "Bacteroides fragilis",
    family: "Bacteroidaceae",
    phylum: "Bacteroidota",
    role: "opportunistic",
    ref: [0.2, 4],
    notes: "A normal gut resident that is completely safe in ordinary amounts, but can trigger irritation if it grows too dominant.",
  },
  {
    taxon: "Phocaeicola vulgatus",
    family: "Bacteroidaceae",
    phylum: "Bacteroidota",
    role: "commensal",
    ref: [1, 10],
    notes: "A widespread standard resident of the human colon helping digest daily foods.",
  },
  {
    taxon: "Prevotella copri",
    family: "Prevotellaceae",
    phylum: "Bacteroidota",
    role: "commensal",
    ref: [0.1, 15],
    notes: "Thrives in people who eat fiber-rich Mediterranean or plant-centric diets with whole grains and legumes.",
    benefits: "Helps process high-fiber foods efficiently.",
  },
  {
    taxon: "Alistipes putredinis",
    family: "Rikenellaceae",
    phylum: "Bacteroidota",
    role: "commensal",
    ref: [0.2, 4],
    notes: "A peaceful bacterium that helps process dietary proteins and digestive bile acids.",
  },
  {
    taxon: "Oxalobacter formigenes",
    family: "Oxalobacteraceae",
    phylum: "Proteobacteria",
    role: "beneficial",
    ref: [0.01, 0.4],
    notes: "A dedicated helper that breaks down oxalates found in spinach, nuts, and tea, protecting kidney and urinary health.",
    benefits: "Reduces oxalate absorption and naturally protects against kidney stones.",
  },
  {
    taxon: "Methanobrevibacter smithii",
    family: "Methanobacteriaceae",
    phylum: "Euryarchaeota",
    role: "commensal",
    ref: [0.01, 2],
    notes: "An ancient microscopic resident that absorbs excess hydrogen gas. When levels are very high, it can slow down bowel transit.",
  },
  {
    taxon: "Escherichia coli",
    family: "Enterobacteriaceae",
    phylum: "Proteobacteria",
    role: "opportunistic",
    ref: [0.01, 0.8],
    notes: "A common gut microbe. Normal in small quantities, but an overgrowth can signal gut irritation or recent antibiotic disruption.",
  },
  {
    taxon: "Klebsiella pneumoniae",
    family: "Enterobacteriaceae",
    phylum: "Proteobacteria",
    role: "pathogen",
    ref: [0, 0.05],
    notes: "A microbe to keep low. In healthy guts it remains quiet, but doctors monitor it because it can carry resistance genes.",
  },
  {
    taxon: "Enterobacter cloacae",
    family: "Enterobacteriaceae",
    phylum: "Proteobacteria",
    role: "pathogen",
    ref: [0, 0.05],
    notes: "A potential troublemaker bacteria kept suppressed by healthy beneficial microbes in a balanced gut.",
  },
  {
    taxon: "Enterococcus faecium",
    family: "Enterococcaceae",
    phylum: "Firmicutes",
    role: "pathogen",
    ref: [0, 0.2],
    notes: "A tough bacteria that can expand when friendly gut microbes are reduced after heavy antibiotic use.",
  },
  {
    taxon: "Enterococcus faecalis",
    family: "Enterococcaceae",
    phylum: "Firmicutes",
    role: "opportunistic",
    ref: [0.01, 0.4],
    notes: "Commonly present in small amounts; kept in check by diverse friendly bacteria.",
  },
  {
    taxon: "Clostridioides difficile",
    family: "Peptostreptococcaceae",
    phylum: "Firmicutes",
    role: "pathogen",
    ref: [0, 0.02],
    notes: "Can live quietly in the gut without causing issues. Only requires treatment if you have active symptoms like watery diarrhea.",
  },
  {
    taxon: "Salmonella enterica",
    family: "Enterobacteriaceae",
    phylum: "Proteobacteria",
    role: "pathogen",
    ref: [0, 0.001],
    notes: "A foodborne bacteria that causes acute stomach upset and diarrhea. Normally not present in healthy individuals.",
  },
  {
    taxon: "Campylobacter jejuni",
    family: "Campylobacteraceae",
    phylum: "Proteobacteria",
    role: "pathogen",
    ref: [0, 0.001],
    notes: "A common cause of food-related tummy bugs that should ideally be absent.",
  },
  {
    taxon: "Shigella sonnei",
    family: "Enterobacteriaceae",
    phylum: "Proteobacteria",
    role: "pathogen",
    ref: [0, 0.001],
    notes: "An infectious foodborne organism causing digestive upset; not found in healthy gut samples.",
  },
  {
    taxon: "Pseudomonas aeruginosa",
    family: "Pseudomonadaceae",
    phylum: "Proteobacteria",
    role: "pathogen",
    ref: [0, 0.02],
    notes: "An environmental bacteria that rarely colonizes a healthy, well-diversified digestive tract.",
  },
  {
    taxon: "Acinetobacter baumannii",
    family: "Moraxellaceae",
    phylum: "Proteobacteria",
    role: "pathogen",
    ref: [0, 0.01],
    notes: "A hospital-associated microbe monitored for antibiotic safety. Very rare in routine community samples.",
  },
  {
    taxon: "Staphylococcus aureus",
    family: "Staphylococcaceae",
    phylum: "Firmicutes",
    role: "pathogen",
    ref: [0, 0.05],
    notes: "Can occasionally pass through the digestive tract quietly without causing any digestive symptoms.",
  },
  {
    taxon: "Helicobacter pylori",
    family: "Helicobacteraceae",
    phylum: "Proteobacteria",
    role: "pathogen",
    ref: [0, 0.01],
    notes: "A stomach bacteria that can cause acid or ulcers in the upper stomach. Stool tests detect traces passing through.",
  },
  {
    taxon: "Fusobacterium nucleatum",
    family: "Fusobacteriaceae",
    phylum: "Fusobacteriota",
    role: "opportunistic",
    ref: [0, 0.3],
    notes: "A bacteria from the mouth that can travel down to the gut if the mouth-gut barrier is irritated.",
  },
  {
    taxon: "Streptococcus gallolyticus",
    family: "Streptococcaceae",
    phylum: "Firmicutes",
    role: "opportunistic",
    ref: [0, 0.1],
    notes: "Monitored as a potential overgrowth colonizer in routine clinical gut screenings.",
  },
  {
    taxon: "Bilophila wadsworthia",
    family: "Desulfovibrionaceae",
    phylum: "Proteobacteria",
    role: "opportunistic",
    ref: [0.01, 0.4],
    notes: "A bile-loving microbe that tends to increase when meals are very high in saturated fats or fried foods.",
  },
  {
    taxon: "Desulfovibrio piger",
    family: "Desulfovibrionaceae",
    phylum: "Proteobacteria",
    role: "opportunistic",
    ref: [0.01, 0.3],
    notes: "Produces sulfur compounds in the gut. Eating more diverse prebiotic fiber helps keep it balanced.",
  },
  {
    taxon: "Veillonella parvula",
    family: "Veillonellaceae",
    phylum: "Firmicutes",
    role: "commensal",
    ref: [0.05, 1.5],
    notes: "A natural lactate-processing helper that is often active after workouts or fiber digestion.",
  },
  {
    taxon: "Ruminococcus gnavus",
    family: "Lachnospiraceae",
    phylum: "Firmicutes",
    role: "opportunistic",
    ref: [0.1, 1.5],
    notes: "Can expand during temporary digestive inflammation. Increasing soothing plant fibers helps bring it down.",
  },
  {
    taxon: "Ruminococcus torques",
    family: "Lachnospiraceae",
    phylum: "Firmicutes",
    role: "opportunistic",
    ref: [0.05, 1],
    notes: "A natural gut forager. Balanced levels help renew the gut lining; very high levels suggest digestive sensitivity.",
  },
  {
    taxon: "Collinsella aerofaciens",
    family: "Coriobacteriaceae",
    phylum: "Actinobacteriota",
    role: "commensal",
    ref: [0.1, 3],
    notes: "Helps process fats and bile acids. Responsive to adjustments in dietary fiber and healthy fats.",
  },
];

export type AmrDef = {
  gene: string;
  class: string;
  organisms: string[];
  whoPriority: "critical" | "high" | "medium";
  interpretation: string;
  clinicalNote: string;
};

export const AMR_PANEL: AmrDef[] = [
  {
    gene: "blaCTX-M-15",
    class: "Cephalosporin Resistance (ESBL)",
    organisms: ["Escherichia coli", "Klebsiella pneumoniae"],
    whoPriority: "critical",
    interpretation: "A genetic shield that allows bacteria to resist cephalosporin antibiotics (like ceftriaxone).",
    clinicalNote: "Having this in your stool is quiet colonization, not an active sickness. If you ever need antibiotics for a urinary or body infection, inform your doctor so they choose the most effective medicine.",
  },
  {
    gene: "blaNDM-1",
    class: "Carbapenem Resistance (MBL)",
    organisms: ["Klebsiella pneumoniae", "Escherichia coli"],
    whoPriority: "critical",
    interpretation: "A defense gene that helps bacteria resist carbapenem antibiotics (strong hospital-grade medicines).",
    clinicalNote: "This represents peaceful carriage in the gut. Helpful information for your hospital care team to ensure appropriate hygiene precautions if admitted.",
  },
  {
    gene: "blaKPC-2",
    class: "Carbapenem Resistance (Class A)",
    organisms: ["Klebsiella pneumoniae"],
    whoPriority: "critical",
    interpretation: "Produces an enzyme that blocks carbapenem medications.",
    clinicalNote: "Not an illness by itself. Show this to your medical provider if you are ever prescribed hospital antibiotics.",
  },
  {
    gene: "blaOXA-48",
    class: "Carbapenem Resistance (Class D)",
    organisms: ["Klebsiella pneumoniae", "Escherichia coli"],
    whoPriority: "critical",
    interpretation: "A resistance marker against certain hospital-grade penicillin and carbapenem medicines.",
    clinicalNote: "Silent colonization in the gut. No immediate treatment is needed unless you have an active medical infection.",
  },
  {
    gene: "mcr-1",
    class: "Colistin Resistance",
    organisms: ["Escherichia coli"],
    whoPriority: "critical",
    interpretation: "A resistance gene against colistin (a specialized last-line antibiotic).",
    clinicalNote: "Carried quietly in the digestive tract. Helps your clinical team select the most targeted medicines if treatment is ever needed.",
  },
  {
    gene: "vanA",
    class: "Vancomycin Resistance (VRE)",
    organisms: ["Enterococcus faecium"],
    whoPriority: "high",
    interpretation: "A genetic trait that lets enterococci bacteria withstand vancomycin antibiotic treatment.",
    clinicalNote: "Natural colonization in the digestive tract. Not a disease; no antibiotics are required to clear it.",
  },
  {
    gene: "vanB",
    class: "Vancomycin Resistance (VRE)",
    organisms: ["Enterococcus faecium"],
    whoPriority: "high",
    interpretation: "A related gene allowing bacteria to resist vancomycin medications.",
    clinicalNote: "Useful reference data for your physician if treating urinary or abdominal symptoms.",
  },
  {
    gene: "mecA",
    class: "Methicillin Resistance (MRSA)",
    organisms: ["Staphylococcus aureus"],
    whoPriority: "high",
    interpretation: "Allows Staphylococcus bacteria to resist standard penicillin and methicillin antibiotics.",
    clinicalNote: "Carried peacefully in the gut. Important note for skin and surgical safety planning.",
  },
  {
    gene: "ermB",
    class: "Macrolide & Lincosamide Resistance",
    organisms: ["Enterococcus faecium", "Bacteroides fragilis", "Clostridioides difficile"],
    whoPriority: "medium",
    interpretation: "Helps bacteria resist common macrolide antibiotics (such as erythromycin and clindamycin).",
    clinicalNote: "Very common across healthy adult gut bacteria; helps guide future medication choices.",
  },
  {
    gene: "tetM",
    class: "Tetracycline Resistance",
    organisms: ["Enterococcus faecalis", "Escherichia coli"],
    whoPriority: "medium",
    interpretation: "Protects bacterial cells against tetracycline and doxycycline antibiotics.",
    clinicalNote: "Widely found across normal human populations. Does not indicate sickness.",
  },
  {
    gene: "qnrS",
    class: "Fluoroquinolone Resistance",
    organisms: ["Escherichia coli", "Klebsiella pneumoniae", "Salmonella enterica"],
    whoPriority: "high",
    interpretation: "Reduces bacterial sensitivity to ciprofloxacin and related fluoroquinolone antibiotics.",
    clinicalNote: "Helps your doctor choose alternative medicines when treating traveler's diarrhea or urinary bugs.",
  },
  {
    gene: "aac(6')-Ib-cr",
    class: "Aminoglycoside & Quinolone Resistance",
    organisms: ["Escherichia coli", "Klebsiella pneumoniae"],
    whoPriority: "high",
    interpretation: "Dual-acting enzyme modifying aminoglycoside and ciprofloxacin medications.",
    clinicalNote: "Helpful background information for your doctor when prescribing antibiotic therapy.",
  },
  {
    gene: "sul1",
    class: "Sulfonamide Resistance",
    organisms: ["Escherichia coli"],
    whoPriority: "medium",
    interpretation: "Marker of resistance to sulfa-based antibiotic medicines.",
    clinicalNote: "Common background gene in modern gut microbiomes.",
  },
  {
    gene: "dfrA17",
    class: "Trimethoprim Resistance",
    organisms: ["Escherichia coli"],
    whoPriority: "medium",
    interpretation: "Allows bacteria to bypass trimethoprim medications (often used for mild UTIs).",
    clinicalNote: "Guides your doctor to pick effective alternatives for urinary or digestive discomfort.",
  },
  {
    gene: "catB3",
    class: "Chloramphenicol Resistance",
    organisms: ["Escherichia coli", "Klebsiella pneumoniae"],
    whoPriority: "medium",
    interpretation: "Neutralizes chloramphenicol family antibiotics.",
    clinicalNote: "Rarely needed in routine care; tracked as part of global antibiotic resistance surveillance.",
  },
  {
    gene: "floR",
    class: "Phenicol Drug Resistance",
    organisms: ["Salmonella enterica", "Escherichia coli"],
    whoPriority: "medium",
    interpretation: "Pumps phenicol antibiotics out of bacterial cells.",
    clinicalNote: "Tracked for epidemiological awareness.",
  },
  {
    gene: "aph(3')-III",
    class: "Aminoglycoside Resistance",
    organisms: ["Enterococcus faecium", "Staphylococcus aureus"],
    whoPriority: "medium",
    interpretation: "Neutralizes kanamycin and neomycin antibiotic compounds.",
    clinicalNote: "Background resistance marker with minimal impact on first-line treatments.",
  },
  {
    gene: "cfiA",
    class: "Carbapenem Resistance in Bacteroides",
    organisms: ["Bacteroides fragilis"],
    whoPriority: "high",
    interpretation: "A resistance gene found specifically inside Bacteroides anaerobic bacteria.",
    clinicalNote: "Valuable context for surgeons and gastroenterologists during clinical evaluations.",
  },
  {
    gene: "nimB",
    class: "Nitroimidazole / Metronidazole Resistance",
    organisms: ["Bacteroides fragilis"],
    whoPriority: "medium",
    interpretation: "Can decrease sensitivity to metronidazole (Flagyl) medications.",
    clinicalNote: "Helps clinicians tailor treatment for anaerobic infections.",
  },
  {
    gene: "gyrA_T86I",
    class: "Fluoroquinolone Resistance in Campylobacter",
    organisms: ["Campylobacter jejuni"],
    whoPriority: "high",
    interpretation: "A common mutation in foodborne Campylobacter resisting ciprofloxacin.",
    clinicalNote: "If treating a food bug, doctors prefer azithromycin over ciprofloxacin.",
  },
];

export type DiseaseDef = {
  id: string;
  name: string;
  category: string;
  evidence: string;
  clinicianNote: string;
  patientNote: string;
};

export const DISEASES: DiseaseDef[] = [
  {
    id: "ibd",
    name: "Digestive Inflammation Pattern (IBD-style)",
    category: "Gut Inflammation",
    evidence:
      "Measures whether calming, anti-inflammatory bacteria (like Faecalibacterium) are depleted and inflammatory bacteria are elevated. This is an ecological balance score, NOT a medical diagnosis.",
    clinicianNote:
      "Pattern indicator only. If patient has active symptoms, correlate with fecal calprotectin, CRP, and clinical evaluation before diagnosis.",
    patientNote:
      "Your gut community shows signs of inflammation compared to a typical baseline. This does NOT mean you have Crohn's or Colitis. Talk to your doctor if you experience persistent stomach pain, bleeding, or chronic diarrhea.",
  },
  {
    id: "ibs",
    name: "Digestive Sensitivity & Comfort Pattern (IBS-style)",
    category: "Gut Sensitivity",
    evidence:
      "Evaluates bacterial signals linked to sensitive digestion, occasional bloating, gas, or irregular bowel transit.",
    clinicianNote:
      "Evaluate using clinical Rome IV criteria. Optimize with dietary fiber adjustments, stress management, and food timing.",
    patientNote:
      "Your gut shows patterns often seen in people with sensitive stomachs. Gentle changes in fiber intake, hydration, and stress reduction often make a big difference.",
  },
  {
    id: "metabolic",
    name: "Metabolism & Blood Sugar Balance Pattern",
    category: "Metabolic Health",
    evidence:
      "Looks at friendly microbes (like Akkermansia and butyrate producers) that help your body manage blood sugar, insulin, and energy balance.",
    clinicianNote:
      "Correlate with fasting glucose, HbA1c, and lipid panel. Lifestyle and fiber-rich nutrition remain first-line supports.",
    patientNote:
      "Your gut bacteria play an active role in metabolism. Eating a wide variety of colorful vegetables, legumes, and whole grains supports steady energy and healthy blood sugar.",
  },
  {
    id: "nafld",
    name: "Liver Metabolism & Wellness Pattern",
    category: "Liver Support",
    evidence:
      "Assesses bacterial balance and bile-acid transformation signals connected to healthy liver and fat metabolism.",
    clinicianNote:
      "Consider routine liver enzyme screening if clinically indicated. Focus on reducing ultra-processed sugars and alcohol.",
    patientNote:
      "Your gut and liver work closely together. Minimizing refined sugars, alcohol, and late-night snacks while increasing leafy greens supports optimal liver health.",
  },
  {
    id: "obesity",
    name: "Weight & Metabolic Ecology Pattern",
    category: "Metabolic Health",
    evidence:
      "Studies show that a more diverse, fiber-fed gut community supports healthy appetite signaling, metabolism, and weight maintenance.",
    clinicianNote:
      "Useful as a positive coaching adjunct for long-term dietary fiber diversification.",
    patientNote:
      "There is no single 'weight microbe.' Building a diverse, fiber-rich gut garden over several months helps support natural energy and long-term vitality.",
  },
  {
    id: "atopy",
    name: "Allergy & Immune Balance Pattern",
    category: "Immune Health",
    evidence:
      "Examines friendly probiotic bacteria that help train your immune cells to stay calm and not overreact to everyday environmental triggers.",
    clinicianNote:
      "Exploratory immune marker. Most meaningful in early childhood history; supportive context for adults.",
    patientNote:
      "Your gut houses over 70% of your immune system. Nourishing your gut with fermented foods and diverse plants helps promote a balanced, calm immune response.",
  },
  {
    id: "sibo",
    name: "Digestive Gas & Fermentation Signals",
    category: "Gut Sensitivity",
    evidence:
      "Checks for bacterial patterns linked to rapid fermentation or high methane gas production.",
    clinicianNote:
      "Stool DNA cannot diagnose small bowel overgrowth. Order formal breath testing if SIBO is clinically suspected.",
    patientNote:
      "Feeling bloated or gassy after meals can have many causes. This stool test looks at colon microbes; talk to your doctor if bloating is persistent.",
  },
  {
    id: "cdiff",
    name: "C. difficile Protection & Resilience",
    category: "Gut Resilience",
    evidence:
      "Evaluates whether your friendly bacteria provide a strong, protective shield against unwanted invaders after taking antibiotics.",
    clinicianNote:
      "Silent carriage is common after antibiotics. Only order C. diff toxin testing if patient experiences acute watery diarrhea.",
    patientNote:
      "Healthy gut bacteria act like a thick lawn that prevents weeds from growing. Eating diverse prebiotic fibers helps restore this natural protective shield.",
  },
  {
    id: "abx",
    name: "Post-Antibiotic Recovery Pattern",
    category: "Recovery",
    evidence:
      "Measures temporary loss of bacterial diversity and recovery needs following recent antibiotic medications.",
    clinicianNote:
      "Expect gradual natural recovery over 4–12 weeks. Encourage fermented foods and soluble prebiotic fibers.",
    patientNote:
      "Antibiotics are life-saving medications, but they also clear out helpful bacteria. Your gut will naturally rebuild over several weeks with varied, colorful whole foods.",
  },
  {
    id: "autoimmune",
    name: "Immune Overactivity Signals",
    category: "Immune Health",
    evidence:
      "Assesses gut barrier integrity and bacteria associated with systemic immune balance.",
    clinicianNote:
      "Exploratory research pattern only. Do not diagnose autoimmune conditions from stool metagenomics.",
    patientNote:
      "Autoimmune wellness involves genetics, stress, and lifestyle. This section provides general background context on your digestive immune balance.",
  },
  {
    id: "parkinson",
    name: "Neurological & Gut Transit Signals",
    category: "Nervous System",
    evidence:
      "Observational research connects slow bowel transit and lower beneficial short-chain fatty acids with nervous system regulation.",
    clinicianNote:
      "Supportive research score. Neurology referrals are strictly based on clinical examination, not stool tests.",
    patientNote:
      "This is NOT a neurological test. It simply observes bacterial balance and bowel regularity to support your daily digestive comfort.",
  },
];

export const PATHWAYS = [
  { name: "Butyrate synthesis (natural gut lining fuel)", expected: 1 },
  { name: "Propionate production (metabolism & fullness signal)", expected: 1 },
  { name: "Acetate formation (beneficial friendly acid)", expected: 1 },
  { name: "Lactate utilization (calming digestive acidity)", expected: 1 },
  { name: "Bile salt hydrolase (healthy fat processing)", expected: 1 },
  { name: "Secondary bile acid transformation", expected: 0.7 },
  { name: "Tryptophan to indole conversion (gut shield signal)", expected: 0.8 },
  { name: "Tryptophan to IPA (antioxidant shield)", expected: 0.6 },
  { name: "GABA neurotransmitter synthesis (calm signal)", expected: 0.5 },
  { name: "Vitamin B12 natural biosynthesis", expected: 0.7 },
  { name: "Folate (Vitamin B9) biosynthesis", expected: 0.8 },
  { name: "Riboflavin (Vitamin B2) biosynthesis", expected: 0.8 },
  { name: "Mucin layer turnover & maintenance", expected: 0.9 },
  { name: "Resistant starch digestion (plant fuel)", expected: 1 },
  { name: "Prebiotic inulin & FOS fermentation", expected: 0.9 },
  { name: "Plant xylan fiber breakdown", expected: 0.8 },
  { name: "Hydrogen sulphide clearance pathway", expected: 0.4 },
  { name: "Choline to TMA transformation pathway", expected: 0.5 },
  { name: "Colibactin surveillance marker", expected: 0.1 },
  { name: "Beta-glucuronidase balance pathway", expected: 0.7 },
];

export const METHODS_PARAS = [
  "1. Sample Collection & Preservation: Stool was collected in a specialized DNA-stabilizing tube that preserves the exact microbial community without degradation during transport.",
  "2. High-Yield DNA Extraction: Bacterial DNA was purified using laboratory bead-beating protocols designed to recover both Gram-positive (probiotics) and Gram-negative bacteria equally.",
  "3. Next-Generation Metagenomic Sequencing: Comprehensive DNA sequencing was performed to identify bacterial species and functional genes with high statistical accuracy.",
  "4. Computer Classification & AMR Screening: Sequences were compared against international reference databases (including CARD and WHO priority lists) to identify bacteria and antibiotic resistance markers.",
  "5. Clinical Interpretation: Reference ranges are derived from healthy adult population benchmarks. This report is designed to provide actionable health insights alongside standard medical evaluations.",
];

export type ReferenceDatabase = {
  name: string;
  authority: string;
  category: "Taxonomy & Baselines" | "AMR & Resistome" | "Disease Biomarkers" | "Metabolic Pathways";
  version: string;
  description: string;
  keyUse: string;
};

export const REFERENCE_DATABASES: ReferenceDatabase[] = [
  {
    name: "NIH Human Microbiome Project (HMP / HMP2)",
    authority: "National Institutes of Health (NIH)",
    category: "Taxonomy & Baselines",
    version: "HMP2 Unified Metagenomic Cohort",
    description: "Multicenter metagenomic sequencing of thousands of healthy human adults establishing standard healthy relative abundance distributions.",
    keyUse: "Baseline healthy reference range intervals (Min–Max % limits) for sentinel gut bacteria.",
  },
  {
    name: "Comprehensive Antibiotic Resistance Database (CARD)",
    authority: "McMaster University & International AMR Consortium",
    category: "AMR & Resistome",
    version: "CARD 3.2.9 / ARO Ontology",
    description: "Rigorous, peer-reviewed database of antimicrobial resistance genes, resistance mechanisms, and conferring drug classes.",
    keyUse: "Detection, genomic annotation, and clinical classification of carbapenemases (blaNDM, blaKPC), ESBLs, and resistance determinants.",
  },
  {
    name: "WHO Bacterial Priority Pathogens List (BPPL)",
    authority: "World Health Organization (WHO)",
    category: "AMR & Resistome",
    version: "2024 Revision",
    description: "Global consensus guide on critical, high, and medium priority antimicrobial resistant pathogens to guide antibiotic stewardship.",
    keyUse: "Risk-tier stratification (Critical, High, Medium priority badges) across all resistome findings.",
  },
  {
    name: "NCBI Reference Sequence Database (RefSeq & NDARO)",
    authority: "National Center for Biotechnology Information (NCBI / NIH)",
    category: "Taxonomy & Baselines",
    version: "Release 222",
    description: "Comprehensive, integrated, well-annotated set of reference genomic sequences for bacterial species and antibiotic resistance organisms.",
    keyUse: "Taxonomic lineage, family-phylum hierarchy, and species-level genomic identification.",
  },
  {
    name: "MetaHIT Gut Microbial Gene Catalog",
    authority: "European Commission MetaHIT Consortium",
    category: "Disease Biomarkers",
    version: "3.3M Gene Catalog",
    description: "European multi-cohort metagenomic screening identifying microbial gene shifts in inflammatory bowel disease, obesity, and diabetes.",
    keyUse: "Dysbiosis pattern score calibration for inflammatory bowel and metabolic syndromes.",
  },
  {
    name: "MetaCyc & KEGG Microbial Pathway Database",
    authority: "SRI International & Kyoto University",
    category: "Metabolic Pathways",
    version: "MetaCyc 27.5 / KEGG Orthology",
    description: "Experimentally validated metabolic pathways for bacterial biosynthesis of short-chain fatty acids (SCFAs), mucin degradation, and secondary metabolites.",
    keyUse: "Functional potential indices for Butyrate, Propionate, Acetate, and TMA synthesis.",
  },
  {
    name: "q2-health-index (QIIME 2 Gut Microbiome Health Index)",
    authority: "Gupta et al. 2020 / Jagiellonian University (bioinf-mcb)",
    category: "Disease Biomarkers",
    version: "v0.1 / Nature Comm 2020",
    description: "Multicenter meta-analysis of 4,347 human stool metagenomes across 34 studies distinguishing healthy vs 12 disease conditions using 50 indicator species.",
    keyUse: "Evaluation of the collective ratio of 7 health-prevalent to 43 health-scarce species (GMHI > 0 Healthy-like, < 0 Dysbiotic).",
  },
];

export const REFERENCES = [
  "Gupta VK et al. A robust health index of the human gut microbiome based on species-level profiling. Nature Communications, 2020.",
  "QIIME 2 Plugin for Gut Microbiome Health Index (q2-health-index). Bioinformatics at Małopolska Centre of Biotechnology.",
  "World Health Organization (WHO). Bacterial Priority Pathogens List, 2024.",
  "NIH Human Microbiome Project Consortium. Structure, function and diversity of the healthy human microbiome. Nature.",
  "Qin J et al. A human gut microbial gene catalogue established by metagenomic sequencing. Nature.",
  "Sokol H et al. Faecalibacterium prausnitzii is an anti-inflammatory commensal protecting the gut barrier. PNAS.",
  "Depommier C et al. Akkermansia muciniphila supplementation and metabolic health. Nature Medicine.",
  "Lloyd-Price J et al. Multi-omics of the gut microbial ecosystem in inflammatory bowel diseases. Nature.",
  "Wirbel J et al. Meta-analysis of fecal metagenomes reveals global microbial signatures of colorectal cancer. Nature Medicine.",
  "Vich Vila A et al. Gut microbiota composition changes in digestive inflammation. Science Translational Medicine.",
  "Forslund K et al. Disentangling diabetes and treatment signatures in the human gut microbiota. Nature.",
  "Buffie CG et al. Precision microbiome reconstitution restores natural resistance against C. difficile. Nature.",
  "Alcock BP et al. CARD: Comprehensive Antibiotic Resistance Database.",
  "CDC. Antibiotic Resistance Threats in the United States.",
  "David LA et al. Diet rapidly and reproducibly alters the human gut microbiome. Nature.",
  "Wastyk HC et al. Gut-microbiota-targeted diets and fermented foods modulate human immune status. Cell.",
  "Sonnenburg JL, Bäckhed F. Diet–microbiota interactions as key moderators of human metabolism. Nature.",
  "Stewart CJ et al. Temporal development of the gut microbiome in early childhood from the TEDDY study. Nature, 2018.",
  "Wilmanski T et al. Gut microbiome pattern reflects healthy ageing and predicts survival in humans. Nature Metabolism, 2021.",
  "Claesson MJ et al. Gut microbiota composition correlates with diet and health in the elderly (ELDERMET). Nature, 2012.",
];

export const GLOSSARY: { term: string; def: string }[] = [
  { term: "Gut Microbiome", def: "The community of trillions of friendly and helper bacteria living in your digestive tract that help digest food, power immunity, and support your mood." },
  { term: "Gut Score (0–100)", def: "An overall health grade combining your microbial diversity, levels of protective bacteria, low inflammation, and lack of hospital superbug genes." },
  { term: "Shannon Diversity", def: "A measure of how varied and rich your gut bacteria are. Like a lush rainforest, a more diverse gut is stronger, more resilient, and healthier." },
  { term: "Relative Abundance (%)", def: "The percentage share that a specific bacteria represents out of all the bacteria found in your sample." },
  { term: "Short-Chain Fatty Acids (SCFAs)", def: "Healing, energizing acids (like butyrate, acetate, and propionate) produced when good bacteria ferment dietary fiber." },
  { term: "Butyrate", def: "The main super-fuel for your colon cells. It heals the gut lining, calms inflammation, and strengthens digestive comfort." },
  { term: "Prebiotics", def: "Special dietary plant fibers (found in dals, onions, garlic, methi seeds, isabgol, and millets) that act as food to feed and grow your friendly bacteria." },
  { term: "Probiotics", def: "Live beneficial bacteria found in fermented foods (like homemade curd/dahi, fresh spiced chaas, and fermented batters) that support your digestive and immune systems." },
  { term: "AMR (Antimicrobial Resistance)", def: "Natural defense genes in bacteria. Knowing which ones you carry helps your doctor choose the exact right antibiotic if you ever get sick." },
  { term: "Dysbiosis", def: "A temporary imbalance in your gut — such as when friendly bacteria are low and potential overgrowth bacteria temporarily grow higher." },
  { term: "Typical (Score: 0–40)", def: "Normal & Healthy Baseline: Your gut bacteria look balanced, similar to healthy individuals with no digestive issues." },
  { term: "Borderline (Score: 41–70)", def: "Slightly Off / Keep an Eye On It: Some bacteria levels are slightly higher or lower than usual. Gentle nutrition or lifestyle tweaks can help restore healthy balance." },
  { term: "Elevated (Score: 71–100)", def: "Higher Than Normal / Needs Attention: Shows a noticeable bacterial pattern shift often associated with digestive irritation. Not a medical disease diagnosis, but a signal for your doctor to evaluate." },
  { term: "Beneficial Bacteria", def: "Probiotic and protective bacteria (like Faecalibacterium, Bifidobacterium, and Akkermansia) that actively nourish your gut lining, produce soothing acids (SCFAs), and defend your health." },
  { term: "Normal Bacteria", def: "Peaceful everyday bacteria that naturally live in your gut without causing harm or problems. They share your meals, help digest dietary fiber, and produce vitamins as harmless permanent residents." },
  { term: "Watch Bacteria", def: "Everyday gut bacteria that are completely safe in normal low amounts, but should be watched if levels become elevated or following antibiotics." },
  { term: "Harmful Bacteria", def: "Unwanted bacteria known to trigger acute gut infections, toxin release, or digestive illness, which clinical screening monitors closely." },
  { term: "GMHI (Gut Microbiome Health Index)", def: "A validated mathematical ratio from Gupta et al. 2020 (Nature Communications) and the q2-health-index plugin comparing 7 health-prevalent indicator species against 43 disease-associated species. A positive score (> 0) denotes a healthy-like ecosystem." },
];

/**
 * 7 Health-Prevalent Species from Gupta et al. (2020) Nature Communications / q2-health-index (MH_species.txt)
 */
export const GMHI_HEALTHY_SPECIES: string[] = [
  "Alistipes senegalensis",
  "Bacteroidales bacterium ph8",
  "Bifidobacterium adolescentis",
  "Bifidobacterium angulatum",
  "Bifidobacterium catenulatum",
  "Lachnospiraceae bacterium 8 1 57FAA",
  "Sutterella wadsworthensis",
];

/**
 * 43 Health-Scarce (Disease-Associated) Species from Gupta et al. (2020) Nature Communications / q2-health-index (MN_species.txt)
 */
export const GMHI_NON_HEALTHY_SPECIES: string[] = [
  "Anaerotruncus colihominis",
  "Atopobium parvulum",
  "Bifidobacterium dentium",
  "Blautia producta",
  "candidate division TM7 single cell isolate TM7c",
  "Clostridiales bacterium 1 7 47FAA",
  "Clostridium asparagiforme",
  "Clostridium bolteae",
  "Clostridium citroniae",
  "Clostridium clostridioforme",
  "Clostridium hathewayi",
  "Clostridium nexile",
  "Clostridium ramosum",
  "Clostridium symbiosum",
  "Eggerthella lenta",
  "Erysipelotrichaceae bacterium 2 2 44A",
  "Flavonifractor plautii",
  "Fusobacterium nucleatum",
  "Gemella morbillorum",
  "Gemella sanguinis",
  "Granulicatella adiacens",
  "Holdemania filiformis",
  "Klebsiella pneumoniae",
  "Lachnospiraceae bacterium 1 4 56FAA",
  "Lachnospiraceae bacterium 2 1 58FAA",
  "Lachnospiraceae bacterium 3 1 57FAA CT1",
  "Lachnospiraceae bacterium 5 1 57FAA",
  "Lachnospiraceae bacterium 9 1 43BFAA",
  "Lactobacillus salivarius",
  "Peptostreptococcus stomatis",
  "Ruminococcaceae bacterium D16",
  "Ruminococcus gnavus",
  "Solobacterium moorei",
  "Streptococcus anginosus",
  "Streptococcus australis",
  "Streptococcus gordonii",
  "Streptococcus infantis",
  "Streptococcus mitis oralis pneumoniae",
  "Streptococcus sanguinis",
  "Streptococcus vestibularis",
  "Subdoligranulum sp 4 3 54A2FAA",
  "Subdoligranulum variabile",
  "Veillonella atypica",
];

export type AgeMicrobiomeTaxon = {
  name: string;
  role: string;
  clinicalSignificance: string;
};

export type AgeMicrobiomeStage = {
  stage: string;
  ageBracket: string;
  shannonBaseline: string;
  summary: string;
  gutScoreImpact: string;
  beneficialTaxa?: AgeMicrobiomeTaxon[];
  harmfulTaxa?: AgeMicrobiomeTaxon[];
  cohortCitation: string;
};

export const AGE_MICROBIOME_DYNAMICS: AgeMicrobiomeStage[] = [
  {
    stage: "Infancy & Early Toddlerhood",
    ageBracket: "0 – 3 Years",
    shannonBaseline: "1.5 – 2.5 H′",
    summary: "Dominated by specialized milk-oligosaccharide (HMO) fermenting Bifidobacteria with lower overall species diversity and a low Firmicutes to Bacteroidota ratio.",
    gutScoreImpact: "Adult models naturally penalize this stage due to lower diversity, though it is healthy for infants. Should be benchmarked against infant HMO-utilization baselines.",
    beneficialTaxa: [
      {
        name: "Bifidobacterium infantis & B. bifidum",
        role: "Primary HMO Fermenter",
        clinicalSignificance: "Ferments human milk oligosaccharides into acetate and lactate, acidifying the colonic lumen to inhibit enteric pathogens and program immune tolerance.",
      },
      {
        name: "Bifidobacterium longum subsp. infantis",
        role: "Mucosal Barrier Pioneer",
        clinicalSignificance: "Upregulates tight junction proteins (Claudin-1, ZO-1), suppresses pathogen translocation, and prevents infantile allergic sensitization.",
      },
      {
        name: "Lactobacillus species (L. rhamnosus, L. reuteri)",
        role: "Lactic Acid Protective Pioneer",
        clinicalSignificance: "Colonizes the neonatal digestive tract, synthesizes hydrogen peroxide and natural bacteriocins, and protects against infantile colic.",
      },
    ],
    harmfulTaxa: [
      {
        name: "Enterobacteriaceae blooms (Pathogenic E. coli, Klebsiella)",
        role: "Facultative Opportunist",
        clinicalSignificance: "Triggers necrotizing enterocolitis (NEC) in premature infants; associated with infantile colic, mucosal inflammation, and systemic distress.",
      },
      {
        name: "Clostridioides difficile & C. perfringens",
        role: "Toxigenic Spore-Former",
        clinicalSignificance: "Asymptomatic carriage is common, but unchecked toxin-producing overgrowth can cause mucosal necrosis and acute diarrheal colitis.",
      },
      {
        name: "Staphylococcus aureus",
        role: "Hospital / Cesarean Colonizer",
        clinicalSignificance: "Frequently enriched following Cesarean delivery or early antibiotic interventions; delays friendly resident bacteria succession.",
      },
    ],
    cohortCitation: "TEDDY Multicenter Infant Cohort (Stewart et al., Nature 2018); Bäckhed et al., Cell Host & Microbe (2015).",
  },
  {
    stage: "Childhood & Adolescence",
    ageBracket: "3 – 17 Years",
    shannonBaseline: "2.8 – 3.8 H′",
    summary: "Ecological maturation transition from simple milk-adapted flora to complex dietary plant-glycan fermenters, stabilizing toward adult composition by early adolescence.",
    gutScoreImpact: "Gut Score steadily climbs toward adult norms; diversity penalties decrease as varied whole grains, pulses, and vegetables are incorporated.",
    beneficialTaxa: [
      {
        name: "Faecalibacterium prausnitzii",
        role: "Butyrate Anchor",
        clinicalSignificance: "Progressively establishes as the dominant colonocyte fuel supplier, promoting epithelial resilience and dampening gut sensitivity.",
      },
      {
        name: "Bacteroides thetaiotaomicron",
        role: "Complex Fiber Workhorse",
        clinicalSignificance: "Possesses extensive CAZyme gene clusters to unlock nutrients from complex vegetable, seed, and legume carbohydrates.",
      },
      {
        name: "Roseburia intestinalis & R. hominis",
        role: "Anti-Inflammatory Fermenter",
        clinicalSignificance: "Synthesizes short-chain fatty acids (SCFAs) that bind GPR41/GPR43 receptors to maintain systemic metabolic balance.",
      },
    ],
    harmfulTaxa: [
      {
        name: "Overgrown Fusobacterium species",
        role: "Inflammatory Pathobiont",
        clinicalSignificance: "Enriched during low-fiber Western dietary phases; implicated in acute appendicitis and mucosal micro-ulcerations.",
      },
      {
        name: "Enterococcus faecium / E. faecalis",
        role: "Post-Antibiotic Opportunist",
        clinicalSignificance: "Readily blooms after pediatric antibiotic therapies (e.g. amoxicillin); carries intrinsic resistance determinants.",
      },
      {
        name: "Bilophila wadsworthia",
        role: "Sulphite-Reducing Opportunist",
        clinicalSignificance: "Fueled by diets high in saturated fats and refined sugars; generates toxic hydrogen sulphide that irritates the mucosal lining.",
      },
    ],
    cohortCitation: "Hollister et al., J Allergy Clin Immunol (2015); Koenig et al., PNAS (2011).",
  },
  {
    stage: "Adulthood (Primary Normative Baseline)",
    ageBracket: "18 – 65 Years",
    shannonBaseline: "3.2 – 4.6 H′",
    summary: "Peak functional redundancy, species richness, and compositional homeostasis. Dominated by balanced Firmicutes, Bacteroidota, and specialized keystone barrier sentinels.",
    gutScoreImpact: "Standard benchmark for the 0–100 Gut Score algorithm (Ref ≥ 70 Eubiotic, 40–69 Moderate Dysbiosis, < 40 Marked Dysbiosis).",
    beneficialTaxa: [
      {
        name: "Faecalibacterium prausnitzii (Min Ref: 3.0%)",
        role: "Keystone Butyrate Sentinel",
        clinicalSignificance: "Essential anti-inflammatory keystone; produces butyrate, inhibits NF-κB inflammatory cascades, and induces regulatory T cells (Tregs).",
      },
      {
        name: "Akkermansia muciniphila (Min Ref: 0.5%)",
        role: "Mucin Shield & Metabolic Guardian",
        clinicalSignificance: "Stimulates continuous goblet cell mucus renewal, seals gut epithelial permeability, and protects against metabolic endotoxemia.",
      },
      {
        name: "Bifidobacterium adolescentis & B. longum",
        role: "Adult Probiotic & B-Vitamin Partner",
        clinicalSignificance: "Cross-feeds butyrate producers, biosynthesizes natural B-vitamins, and competitively excludes enteric invaders.",
      },
      {
        name: "Eubacterium rectale & Coprococcus eutactus",
        role: "SCFA Producer & Gut-Brain Signal",
        clinicalSignificance: "Synthesizes neuroactive short-chain fatty acids that communicate via the vagus nerve to support stable energy and mood.",
      },
    ],
    harmfulTaxa: [
      {
        name: "Ruminococcus gnavus (Upper Ref: 0.5%)",
        role: "Inflammatory Mucin Degrader",
        clinicalSignificance: "Produces inflammatory glucorhamnan polysaccharides and blooms during active inflammatory bowel conditions and epithelial damage.",
      },
      {
        name: "Fusobacterium nucleatum (Upper Ref: 0.05%)",
        role: "Colorectal Neoplasia Driver",
        clinicalSignificance: "Expresses FadA adhesin that binds E-cadherin, driving cellular proliferation and an oncogenic inflammatory microenvironment.",
      },
      {
        name: "Klebsiella pneumoniae & Toxigenic E. coli",
        role: "High-Priority Enteric Pathogens",
        clinicalSignificance: "Primary reservoirs for carbapenemase genes (blaNDM, blaKPC) and genotoxic colibactin causing epithelial DNA strand breaks.",
      },
      {
        name: "Clostridioides difficile (Upper Ref: 0.02%)",
        role: "Toxigenic Pseudomembranous Driver",
        clinicalSignificance: "Secretes enterotoxin A (TcdA) and cytotoxin B (TcdB) triggering acute watery diarrhea and pseudomembranous colitis.",
      },
    ],
    cohortCitation: "NIH Human Microbiome Project (Nature 2012); MetaHIT Consortium (Nature 2010); IBDMDB (Nature 2019).",
  },
  {
    stage: "Older Adults & Geriatric",
    ageBracket: "> 65 – 70+ Years",
    shannonBaseline: "2.6 – 3.8 H′",
    summary: "Natural physiological shifts including reduced stomach acid, altered intestinal motility, immunosenescence, lower dietary fiber diversity, and polypharmacy.",
    gutScoreImpact: "Older adults often score in the 50–70 window due to physiological shifts rather than acute pathology. Longevity research emphasizes interpersonal uniqueness over adult uniformity.",
    beneficialTaxa: [
      {
        name: "Sustained Akkermansia muciniphila",
        role: "Healthy Longevity Biomarker",
        clinicalSignificance: "Enriched in healthy centenarians; preserves aging epithelial thickness and dampens systemic low-grade inflammaging.",
      },
      {
        name: "Christensenella minuta",
        role: "Metabolic Longevity Marker",
        clinicalSignificance: "Natural resident bacteria associated with healthy body composition, visceral fat limitation, and cardiometabolic vitality in advanced age.",
      },
      {
        name: "Bifidobacterium animalis & B. adolescentis",
        role: "Peristalsis & Barrier Supporter",
        clinicalSignificance: "Maintains natural colonization resistance against hospital pathogens and promotes smooth bowel transit in sluggish motility.",
      },
    ],
    harmfulTaxa: [
      {
        name: "Enterobacteriaceae expansion (Proteus, Klebsiella, Citrobacter)",
        role: "Inflammaging Driver",
        clinicalSignificance: "Expands as protective obligate anaerobes decline; drives chronic low-grade endotoxemia (lipopolysaccharide leakage).",
      },
      {
        name: "Eggerthella lenta",
        role: "Cardiac Drug Inactivator",
        clinicalSignificance: "Possesses bacterial Cgr operon enzymes that can pharmacologically inactivate common cardiac medications (e.g. digoxin); elevated in frailty.",
      },
      {
        name: "Streptococcus anginosus & Oral Translocators",
        role: "Oral-to-Gut Translocator",
        clinicalSignificance: "Translocates into the lower GI tract due to declining gastric acid (hypochlorhydria) and acid-suppressive PPI medications.",
      },
    ],
    cohortCitation: "ELDERMET Metagenomic Cohort (Claesson et al., Nature 2012); Wilmanski et al. (Nature Metabolism 2021); Biagi et al. (Curr Biol 2016).",
  },
];

