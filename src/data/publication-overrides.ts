export type PublicationOverride = {
  featured?: boolean;
  date?: string;
  poster?: string;
  project?: string;
  video?: string;
};

export const publicationOverrides: Record<string, PublicationOverride> = {
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
