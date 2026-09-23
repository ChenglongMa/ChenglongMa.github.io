export const profile = {
  name: 'Chenglong Ma',
  givenName: 'Chenglong',
  familyName: 'Ma',
  role: 'Research Fellow',
  affiliation: 'School of Computing Technologies · RMIT University',
  location: 'Melbourne, Australia',
  description:
    'I am a Research Fellow in the School of Computing Technologies at RMIT University. My research spans recommender systems, information retrieval, user modelling, simulation, and responsible AI. Building on earlier work on population-level changes, conformity, and herd behaviour in recommender systems, I now develop LLM-based user simulations for evaluating search and recommendation systems, focusing on dynamic user modelling, automated user profile generation, and verifiable simulation.',
  avatar: '/media/avatar.jpg',
  links: {
    scholar: 'https://scholar.google.com.au/citations?user=cUwRjTQAAAAJ',
    orcid: 'https://orcid.org/0000-0002-6745-4029',
    github: 'https://github.com/ChenglongMa',
    linkedin: 'https://www.linkedin.com/in/machenglong/'
  }
} as const;

export const site = {
  url: 'https://chenglongma.com',
  title: 'Chenglong Ma',
  description:
    'Chenglong Ma is an RMIT Research Fellow working on recommender systems, information retrieval, user modelling, LLM-based simulation, and responsible AI.'
} as const;
