export type CurriculumUnits = {
  [key: string]: string[];
};

export const curriculumUnits: CurriculumUnits = {
  english: [
    'Readers, writers and texts',
    'Time and space',
    'Intertextuality: connecting texts',
  ],
  arabic: [
    'Identities',
    'Experiences',
    'Human ingenuity',
    'Social organization',
    'Sharing the planet',
  ],
  math: [
    'Algebra',
    'Functions',
    'Trigonometry',
    'Calculus',
    'Statistics and probability',
  ],
  physics: [
    'Measurements and uncertainties',
    'Mechanics',
    'Thermal physics',
    'Waves',
    'Electricity and magnetism',
  ],
  biology: [
    'Cell biology',
    'Molecular biology',
    'Genetics',
    'Ecology',
  ],
  business: [
    'Business organization and environment',
    'Human resource management',
    'Finance and accounts',
    'Marketing',
    'Operations management',
  ],
  social: [
    'History',
    'Geography',
    'Global politics',
  ],
};
