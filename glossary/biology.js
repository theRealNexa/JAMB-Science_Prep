// Biology — Need-to-Know glossary
// Root words, prefixes/suffixes, and quick facts worth knowing cold for JAMB.
// Format: { term, meaning, example, fact (optional extra context) }
const BIOLOGY_GLOSSARY = [
  {
    term: "Olfactory (olfac-)",
    meaning: "Relating to the sense of smell",
    example: "Olfactory nerve, olfactory receptors",
    fact: "The olfactory nerve is cranial nerve I — it carries smell signals straight to the brain, bypassing the thalamus (unlike most other senses)."
  },
  {
    term: "Dermal / Derma- (dermato-)",
    meaning: "Relating to the skin",
    example: "Epidermis, dermatitis, dermatology",
    fact: "Human skin has three layers: epidermis (outer), dermis (middle, contains nerves and blood vessels), and hypodermis/subcutaneous layer (innermost, mostly fat)."
  },
  {
    term: "Optic / Ophthalmic (opt-, ophthalm-)",
    meaning: "Relating to the eye or vision",
    example: "Optic nerve, ophthalmology, optic chiasma",
    fact: "The optic nerve (cranial nerve II) carries visual information from the retina to the brain. The optic chiasma is where the two optic nerves partially cross."
  },
  {
    term: "Cardio-",
    meaning: "Relating to the heart",
    example: "Cardiovascular system, cardiac muscle, tachycardia",
    fact: "Cardiac muscle is involuntary but striated — a unique combination not found in skeletal or smooth muscle."
  },
  {
    term: "Hepato-",
    meaning: "Relating to the liver",
    example: "Hepatitis, hepatic portal vein",
    fact: "The liver receives blood from two sources: the hepatic artery (oxygen-rich) and the hepatic portal vein (nutrient-rich, from the intestines)."
  },
  {
    term: "Nephro- / Reno-",
    meaning: "Relating to the kidney",
    example: "Nephron, nephritis, renal artery",
    fact: "The nephron is the functional unit of the kidney — each kidney contains about a million of them."
  },
  {
    term: "Osteo-",
    meaning: "Relating to bone",
    example: "Osteoporosis, osteoblast, osteocyte",
    fact: "Osteoblasts build new bone tissue; osteoclasts break it down. The two work in balance to remodel bone throughout life."
  },
  {
    term: "Gastro-",
    meaning: "Relating to the stomach",
    example: "Gastric juice, gastritis, gastroenteritis",
    fact: "Gastric juice contains hydrochloric acid (HCl), which activates pepsinogen into pepsin — the enzyme that digests protein."
  },
  {
    term: "Pulmo- / Pneumo-",
    meaning: "Relating to the lungs",
    example: "Pulmonary artery, pneumonia",
    fact: "The pulmonary artery is the only artery in the body that carries deoxygenated blood — it runs from the heart to the lungs."
  },
  {
    term: "Cyto-",
    meaning: "Relating to cells",
    example: "Cytoplasm, cytology, cytokinesis",
    fact: "Cytokinesis is the physical splitting of a cell into two after mitosis — distinct from the division of the nucleus itself (karyokinesis)."
  },
  {
    term: "Haemato- / Hemo-",
    meaning: "Relating to blood",
    example: "Haemoglobin, haemolysis, haematology",
    fact: "Haemoglobin contains iron (Fe²⁺) at its core — this is what binds oxygen and gives blood its red colour."
  },
  {
    term: "Neuro-",
    meaning: "Relating to nerves/the nervous system",
    example: "Neuron, neurology, neurotransmitter",
    fact: "A neuron has three main parts: dendrites (receive signals), cell body/soma (contains the nucleus), and an axon (sends signals onward)."
  },
];

// Quick facts — standalone, not tied to a root word. Good for rapid review.
const BIOLOGY_FACTS = [
  {
    fact: "Malaria is caused by Plasmodium, transmitted through the bite of a female Anopheles mosquito.",
    tag: "Disease & Parasites"
  },
  {
    fact: "Only female Anopheles mosquitoes bite and transmit malaria — they need blood protein to develop their eggs. Males feed on nectar.",
    tag: "Disease & Parasites"
  },
  {
    fact: "Photosynthesis occurs mainly in the chloroplast, using chlorophyll to trap light energy and convert CO₂ and water into glucose and oxygen.",
    tag: "Plant Biology"
  },
  {
    fact: "Mitosis produces two genetically identical daughter cells; meiosis produces four genetically varied daughter cells with half the chromosome number.",
    tag: "Cell Biology"
  },
  {
    fact: "DNA replication is described as semi-conservative — each new DNA molecule contains one original (parent) strand and one newly synthesized strand.",
    tag: "Genetics"
  },
  {
    fact: "Enzymes are biological catalysts — proteins that speed up reactions without being consumed. Their activity is affected by temperature and pH.",
    tag: "Biochemistry"
  },
  {
    fact: "Xylem transports water and dissolved minerals upward from roots; phloem transports manufactured food (mainly sucrose) up and down the plant.",
    tag: "Plant Biology"
  },
  {
    fact: "Antibodies are Y-shaped proteins produced by B-lymphocytes (B-cells) in response to specific antigens as part of the immune response.",
    tag: "Immunity"
  },
];
