export type PublicationOverride = {
  featured?: boolean;
  date?: string;
  poster?: string;
  project?: string;
  video?: string;
  context?: string;
  format?: 'Tutorial';
  status?: 'Accepted; to appear' | 'Preprint';
};

export const publicationOverrides: Record<string, PublicationOverride> = {
  ma_verifiable_user_simulation_2026: {
    featured: true,
    date: '2026-07-01',
    format: 'Tutorial',
    context: 'This tutorial introduces a design-and-audit framework for user simulation, connecting structured personas, information-access contracts, execution records, and verification. It provides a practical foundation for inspecting simulated behaviour and distinguishing diagnostic checks from statistical validation.'
  },
  ma_curse_knowledge_2026: {
    featured: true,
    date: '2026-08-26',
    status: 'Accepted; to appear',
    context: 'This work examines answer-side concepts in LLM-generated queries and introduces concept provenance as an information-boundary diagnostic. It connects query simulation with a broader validity question: whether a simulated user’s behaviour is consistent with the information available at that stage of an interaction.'
  },
  ma_pub_llm_enhanced_2025: {
    featured: true,
    context: 'PUB connects behavioural signatures with Big Five personality-related representations to generate differentiated user interactions. It develops the relationship between observed logs and psychologically informed simulation, while motivating separate questions about behavioural fit, the interpretation of inferred traits, and evaluation validity.'
  },
  ma_www_2024: {
    featured: true,
    date: '2024-03-31',
    poster: '/files/posters/www2024.pdf',
    context: 'This work models self-interest alongside informational and normative conformity in recommendation. It connects individual decision-making with social influence and temporal change, extending my research on how behavioural mechanisms affect recommender-system outcomes.'
  },
  rejon_pina_classification_2023: {
    date: '2023-01-01',
    project: 'skin-tone-classifier'
  },
  ma_cikm_2022: {
    date: '2022-10-17',
    video: 'https://dl.acm.org/doi/10.1145/3511808.3557407',
    context: 'NEST links evolving needs with observable preferences to study how population-level disruptions affect collaborative filtering. Its parameterised scenarios provide a basis for examining behavioural adaptation and recommender-system responses, and motivate my later questions about the evidence needed to validate simulated behaviour.'
  },
  ma_sigir_2022: {
    date: '2022-07-11'
  },
  ran_rmit_adms_mmu_rag_2026: {
    status: 'Preprint'
  }
};
