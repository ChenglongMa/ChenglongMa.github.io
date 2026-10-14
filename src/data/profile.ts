export const profile = {
  name: 'Chenglong Ma',
  givenName: 'Chenglong',
  familyName: 'Ma',
  role: 'Research Fellow',
  affiliation: 'School of Computing Technologies · RMIT University',
  location: 'Melbourne, Australia',
  description:
    'I study how people’s needs, personality, and social context shape behaviour in changing information environments. My work combines user modelling with simulation to investigate search and recommendation, and examines when simulated behaviour can support conclusions about real users. Building on research into needs evolution and social influence, I now focus on auditable LLM-based simulation, process validation, and the conditions under which process information supports prediction.',
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
    'Chenglong Ma studies human behaviour, user modelling, and verifiable simulation for search and recommendation at RMIT University.'
} as const;
