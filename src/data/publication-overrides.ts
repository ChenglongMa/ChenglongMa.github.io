export type PublicationOverride = {
  featured?: boolean;
  date?: string;
  poster?: string;
  project?: string;
  video?: string;
};

export const publicationOverrides: Record<string, PublicationOverride> = {
  ma_verifiable_user_simulation_2026: {
    featured: true,
    date: '2026-07-01'
  },
  ma_curse_knowledge_2026: {
    featured: true,
    date: '2026-08-26'
  },
  ma_pub_llm_enhanced_2025: {
    featured: true
  },
  ma_www_2024: {
    featured: true,
    date: '2024-03-31',
    poster: '/files/posters/www2024.pdf'
  },
  rejon_pina_classification_2023: {
    date: '2023-01-01',
    project: 'skin-tone-classifier'
  },
  ma_cikm_2022: {
    date: '2022-10-17',
    video: 'https://dl.acm.org/doi/10.1145/3511808.3557407'
  },
  ma_sigir_2022: {
    date: '2022-07-11'
  }
};
