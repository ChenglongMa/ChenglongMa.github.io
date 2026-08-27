import { readFile, writeFile } from 'node:fs/promises';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';

const outputFile = new URL('../openalex-discoveries.md', import.meta.url);
const apiKey = process.env.OPENALEX_API_KEY;
const orcid = (process.env.ORCID_ID || '0000-0002-6745-4029').replace(/^https?:\/\/orcid\.org\//, '');

if (!orcid) {
  await writeFile(outputFile, '# OpenAlex discovery\n\nOpenAlex discovery skipped: add an ORCID identifier.\n');
  console.log('OpenAlex discovery skipped because ORCID_ID is not configured.');
  process.exit(0);
}

const bibtex = await readFile(new URL('../publications.bib', import.meta.url), 'utf8');
const existingDois = new Set(
  new Cite(bibtex).data
    .map((item) => String(item.DOI || '').replace(/^https?:\/\/doi\.org\//, '').toLowerCase())
    .filter(Boolean)
);

const endpoint = new URL('https://api.openalex.org/works');
endpoint.searchParams.set('filter', `author.orcid:${orcid}`);
endpoint.searchParams.set('per-page', '100');
if (apiKey) endpoint.searchParams.set('api_key', apiKey);

const response = await fetch(endpoint, { headers: { 'User-Agent': 'chenglongma.github.io publication discovery' } });
if (!response.ok) throw new Error(`OpenAlex request failed: ${response.status} ${response.statusText}`);
const { results = [] } = await response.json();

const candidates = results.filter((work) => {
  const doi = String(work.doi || '').replace(/^https?:\/\/doi\.org\//, '').toLowerCase();
  const publicationType = String(work.type || '');
  return doi && !existingDois.has(doi) && ['article', 'conference-paper'].includes(publicationType);
});

const lines = ['# OpenAlex discovery', ''];
if (!candidates.length) {
  lines.push('No potential new publications were found.');
} else {
  lines.push('## Candidate publications', '', 'These journal articles and conference papers are suggestions only. Review their authorship and metadata, then add approved entries manually to `publications.bib`.', '');
  for (const work of candidates) {
    const authors = (work.authorships || []).map((authorship) => authorship.author?.display_name).filter(Boolean).join(', ');
    const venue = work.primary_location?.source?.display_name || 'Venue unavailable';
    const doi = String(work.doi || '').replace(/^https?:\/\/doi\.org\//, '');
    lines.push(`- **${work.title || 'Untitled'}** (${work.publication_year || 'n.d.'}) — ${venue}`);
    if (authors) lines.push(`  - Authors: ${authors}`);
    lines.push(`  - DOI: https://doi.org/${doi}`);
    lines.push(`  - OpenAlex: ${work.id}`);
  }
}

await writeFile(outputFile, `${lines.join('\n')}\n`);
console.log(`OpenAlex discovery completed: ${candidates.length} candidate publication(s).`);
