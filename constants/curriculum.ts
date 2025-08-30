export type UnitDetail = {
  title: string;
  description: string;
};

export type CurriculumUnits = {
  [key: string]: UnitDetail[];
};

export const curriculumUnits: CurriculumUnits = {
  english: [
    {
      title: 'Readers, writers and texts',
      description: 'Explore how language shapes meaning across literary and non\u2011literary texts and practice critical writing.',
    },
    {
      title: 'Time and space',
      description: 'Study literature in its historical and cultural contexts and examine how setting influences interpretation.',
    },
    {
      title: 'Intertextuality: connecting texts',
      description: 'Compare themes, characters and stylistic features across works to understand how texts dialogue with each other.',
    },
  ],
  arabic: [
    {
      title: 'Identities',
      description: 'Investigate how language reflects individual and collective identity within Arabic\u2011speaking cultures.',
    },
    {
      title: 'Experiences',
      description: 'Analyze narratives that portray personal and shared experiences across the Arab world.',
    },
    {
      title: 'Human ingenuity',
      description: 'Examine texts that highlight creativity, innovation and cultural achievements.',
    },
    {
      title: 'Social organization',
      description: 'Study works that discuss institutions, power structures and community dynamics.',
    },
    {
      title: 'Sharing the planet',
      description: 'Evaluate environmental and global issues through Arabic literature and media.',
    },
  ],
  math: [
    {
      title: 'Algebra',
      description: 'Manipulate expressions, equations and sequences with emphasis on IB exam techniques.',
    },
    {
      title: 'Functions',
      description: 'Model real\u2011life situations using different types of functions and transformations.',
    },
    {
      title: 'Trigonometry',
      description: 'Apply trigonometric relationships to solve problems involving angles and periodic phenomena.',
    },
    {
      title: 'Calculus',
      description: 'Understand limits, derivatives and integrals with applications to motion and optimization.',
    },
    {
      title: 'Statistics and probability',
      description: 'Use statistical models and probability theory to interpret data sets.',
    },
  ],
  physics: [
    {
      title: 'Measurements and uncertainties',
      description: 'Develop skills in experimental design, error analysis and use of SI units.',
    },
    {
      title: 'Mechanics',
      description: 'Study motion, forces, energy and momentum through theoretical and practical work.',
    },
    {
      title: 'Thermal physics',
      description: 'Explore temperature, heat transfer and the laws of thermodynamics.',
    },
    {
      title: 'Waves',
      description: 'Investigate properties of mechanical and electromagnetic waves including light and sound.',
    },
    {
      title: 'Electricity and magnetism',
      description: 'Analyze electric circuits, fields and magnetic interactions.',
    },
  ],
  biology: [
    {
      title: 'Cell biology',
      description: 'Examine cell structure, membranes and transport processes through microscopy and experiments.',
    },
    {
      title: 'Molecular biology',
      description: 'Understand DNA, RNA, proteins and the biochemical processes that sustain life.',
    },
    {
      title: 'Genetics',
      description: 'Investigate inheritance patterns, genetic disorders and modern biotechnologies.',
    },
    {
      title: 'Ecology',
      description: 'Study ecosystems, energy flow and conservation with a focus on Jordanian environments.',
    },
  ],
  business: [
    {
      title: 'Business organization and environment',
      description: 'Learn how organizations operate within internal and external environments.',
    },
    {
      title: 'Human resource management',
      description: 'Explore recruitment, motivation and leadership strategies.',
    },
    {
      title: 'Finance and accounts',
      description: 'Analyze financial statements, investment appraisal and sources of finance.',
    },
    {
      title: 'Marketing',
      description: 'Understand market research, product positioning and promotional techniques.',
    },
    {
      title: 'Operations management',
      description: 'Study production methods, quality assurance and supply chain logistics.',
    },
  ],
  social: [
    {
      title: 'History',
      description: 'Investigate historical sources and perspectives focusing on regional and global events.',
    },
    {
      title: 'Geography',
      description: 'Analyze spatial patterns, resource distribution and environmental challenges in Jordan and worldwide.',
    },
    {
      title: 'Global politics',
      description: 'Examine international relations, human rights and the impact of globalization.',
    },
  ],
};
