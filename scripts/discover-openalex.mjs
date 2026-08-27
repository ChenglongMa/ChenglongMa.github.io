import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';

const bibPath = resolve(process.cwd(), 'publications.bib');
const outputFile = resolve(process.cwd(), 'openalex-discoveries.md');
const apiKey = process.env.OPENALEX_API_KEY;
const orcid = (process.env.ORCID_ID || '0000-0002-6745-4029').replace(/^https?:\/\/orcid\.org\//, '');

const text = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const decodeEntities = (value) => text(value).replace(/&amp;/gi, '&');
const escapeBibtex = (value) => decodeEntities(value).replace(/\\/g, '\\\\').replace(/[{}]/g, '\\$&');

function publicationKey(work, existingKeys) {
  const firstAuthor = text(work.authorships?.[0]?.author?.display_name || 'publication');
  const familyName = firstAuthor.split(' ').at(-1) || 'publication';
  const ignoredWords = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'the', 'to', 'with']);
  const titleWords = text(work.title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word && !ignoredWords.has(word))
    .slice(0, 3);
  const stem = [familyName, ...titleWords, work.publication_year].map((part) => text(part).toLowerCase()).join('_');
  let key = stem || `publication_${work.publication_year || 'undated'}`;
  let suffix = 2;
  while (existingKeys.has(key)) key = `${stem}_${suffix++}`;
  existingKeys.add(key);
  return key;
}

function publicationEntry(work, existingKeys) {
  const doi = text(work.doi).replace(/^https?:\/\/doi\.org\//i, '');
  const authors = (work.authorships || []).map((authorship) => text(authorship.author?.display_name)).filter(Boolean).join(' and ');
  const venue = work.primary_location?.source?.display_name || work.primary_location?.raw_source_name;
  const biblio = work.biblio || {};
  const pages = [biblio.first_page, biblio.last_page].filter(Boolean).join('--');
  const fields = [
    ['author', authors],
    ['title', work.title],
    ['year', work.publication_year],
    ['date', work.publication_date],
    ['doi', doi],
    ['url', `https://doi.org/${doi}`],
    [work.type === 'article' ? 'journal' : 'booktitle', venue],
    ['volume', biblio.volume],
    ['number', biblio.issue],
    ['pages', pages]
  ].filter(([, value]) => text(value));
  const entryType = work.type === 'article' ? 'article' : 'inproceedings';
  const key = publicationKey(work, existingKeys);
  return `@${entryType}{${key},\n${fields.map(([name, value]) => `  ${name} = {${escapeBibtex(value)}},`).join('\n')}\n}\n`;
}

if (!orcid) throw new Error('ORCID_ID must be configured.');

const bibtex = await readFile(bibPath, 'utf8');
const existing = new Cite(bibtex).data;
const existingDois = new Set(
  existing
    .map((item) => text(item.DOI).replace(/^https?:\/\/doi\.org\//i, '').toLowerCase())
    .filter(Boolean)
);
const existingKeys = new Set(existing.map((item) => text(item.id)).filter(Boolean));

const endpoint = new URL('https://api.openalex.org/works');
endpoint.searchParams.set('filter', `author.orcid:${orcid}`);
endpoint.searchParams.set('per-page', '100');
if (apiKey) endpoint.searchParams.set('api_key', apiKey);

const response = await fetch(endpoint, { headers: { 'User-Agent': 'chenglongma.github.io publication sync' } });
if (!response.ok) throw new Error(`OpenAlex request failed: ${response.status} ${response.statusText}`);
const { results = [] } = await response.json();

const publications = results
  .filter((work) => {
    const doi = text(work.doi).replace(/^https?:\/\/doi\.org\//i, '').toLowerCase();
    return doi && !existingDois.has(doi) && ['article', 'conference-paper'].includes(text(work.type)) && text(work.title) && work.authorships?.length;
  })
  .sort((left, right) => text(left.publication_date).localeCompare(text(right.publication_date)) || text(left.title).localeCompare(text(right.title)));

if (publications.length) {
  const entries = publications.map((work) => publicationEntry(work, existingKeys)).join('\n');
  await writeFile(bibPath, `${bibtex.trimEnd()}\n\n${entries}`);
}

const lines = ['# OpenAlex publication sync', ''];
if (!publications.length) {
  lines.push('No new journal articles or conference papers were found.');
} else {
  lines.push(`Added ${publications.length} publication${publications.length === 1 ? '' : 's'} to \`publications.bib\`.`, '');
  for (const work of publications) lines.push(`- ${text(work.title)} (${work.publication_year || 'n.d.'}) — ${text(work.doi)}`);
}
await writeFile(outputFile, `${lines.join('\n')}\n`);
console.log(`OpenAlex publication sync completed: ${publications.length} new publication(s).`);
