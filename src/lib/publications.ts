import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import { publicationOverrides } from '../data/publication-overrides';

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  type: 'Journal article' | 'Conference paper' | 'Workshop paper' | 'Other';
  doi?: string;
  url?: string;
  abstract?: string;
  keywords: string[];
  date?: string;
  featured: boolean;
  poster?: string;
  project?: string;
  video?: string;
};

const bibPath = fileURLToPath(new URL('../../publications.bib', import.meta.url));

function normalizeName(author: { family?: string; given?: string; literal?: string }) {
  if (author.literal) return author.literal;
  return [author.given, author.family].filter(Boolean).join(' ');
}

function getVenue(item: Record<string, unknown>) {
  return String(item['container-title'] || item['event-title'] || item.publisher || '');
}

function getType(item: Record<string, unknown>): Publication['type'] {
  const type = String(item.type || '');
  if (type.includes('journal')) return 'Journal article';
  if (type.includes('conference')) return 'Conference paper';
  if (type.includes('chapter')) return 'Other';
  return type.includes('paper') ? 'Workshop paper' : 'Other';
}

function getYear(item: Record<string, unknown>) {
  const issued = item.issued as { 'date-parts'?: number[][] } | undefined;
  const published = item.published as { 'date-parts'?: number[][] } | undefined;
  return issued?.['date-parts']?.[0]?.[0] || published?.['date-parts']?.[0]?.[0] || 0;
}

function getKeywords(item: Record<string, unknown>) {
  const keyword = item.keyword;
  if (Array.isArray(keyword)) return keyword.map(String);
  return String(keyword || '')
    .split(/[,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function getPublications(): Promise<Publication[]> {
  const bibtex = await readFile(bibPath, 'utf8');
  const cite = new Cite(bibtex);

  return (cite.data as Array<Record<string, unknown>>)
    .map((item) => {
      const id = String(item.id);
      const override = publicationOverrides[id] || {};
      const doi = item.DOI ? String(item.DOI).replace(/^https?:\/\/doi\.org\//, '') : undefined;
      const url = item.URL ? String(item.URL) : doi ? `https://doi.org/${doi}` : undefined;
      const authors = Array.isArray(item.author)
        ? item.author.map((author) => normalizeName(author as Parameters<typeof normalizeName>[0]))
        : [];

      return {
        id,
        title: String(item.title || ''),
        authors,
        year: getYear(item),
        venue: getVenue(item),
        type: getType(item),
        doi,
        url,
        abstract: item.abstract ? String(item.abstract) : undefined,
        keywords: getKeywords(item),
        date: override.date,
        featured: Boolean(override.featured),
        poster: override.poster,
        project: override.project,
        video: override.video
      } satisfies Publication;
    })
    .sort((left, right) => right.year - left.year || left.title.localeCompare(right.title));
}

export async function getPublication(id: string) {
  return (await getPublications()).find((publication) => publication.id === id);
}
