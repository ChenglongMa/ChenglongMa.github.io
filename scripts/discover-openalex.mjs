import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import { verifyAuthorship } from './publication-identity.mjs';
import { validatePublications } from './validate-content.mjs';

const bibPath = resolve(process.cwd(), 'publications.bib');
const outputFile = resolve(process.cwd(), 'openalex-discoveries.md');
const apiKey = process.env.OPENALEX_API_KEY;
const orcid = (process.env.ORCID_ID ?? '0000-0002-6745-4029').trim().replace(/^https?:\/\/orcid\.org\//i, '').replace(/\/$/, '').toUpperCase();
const authorId = (process.env.OPENALEX_AUTHOR_ID ?? 'A5038674041').trim().replace(/^https?:\/\/openalex\.org\//i, '').replace(/\/$/, '').toUpperCase();

const text = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const decodeEntities = (value) => text(value).replace(/&amp;/gi, '&');
const escapeBibtex = (value) => decodeEntities(value).replace(/\\/g, '\\\\').replace(/[{}]/g, '\\$&');
const normalizeDoi = (value) => text(value).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').toLowerCase();
const authorName = (authorship) => text(authorship.raw_author_name) || text(authorship.author?.display_name);

function publicationKey(work, existingKeys) {
  const firstAuthor = authorName(work.authorships[0]) || 'publication';
  const familyName = firstAuthor.includes(',') ? firstAuthor.split(',')[0] : firstAuthor.split(' ').at(-1);
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
  const doi = normalizeDoi(work.doi);
  const authors = work.authorships.map(authorName).filter(Boolean).join(' and ');
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

if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid)) throw new Error('ORCID_ID must be a valid ORCID identifier.');
if (!/^A\d+$/.test(authorId)) throw new Error('OPENALEX_AUTHOR_ID must be a valid OpenAlex author identifier.');

const bibtex = await readFile(bibPath, 'utf8');
validatePublications(bibtex);
const existing = new Cite(bibtex).data;
const existingDois = new Set(
  existing
    .map((item) => normalizeDoi(item.DOI))
    .filter(Boolean)
);
const existingKeys = new Set(existing.map((item) => text(item.id)).filter(Boolean));

const endpoint = new URL('https://api.openalex.org/works');
endpoint.searchParams.set('filter', `authorships.author.orcid:${orcid}`);
endpoint.searchParams.set('per-page', '100');
if (apiKey) endpoint.searchParams.set('api_key', apiKey);

// Fetch every page before changing either output file.
const results = [];
const requestedCursors = new Set();
let cursor = '*';
while (cursor !== null) {
  if (requestedCursors.has(cursor)) throw new Error('OpenAlex returned a repeated pagination cursor.');
  requestedCursors.add(cursor);
  endpoint.searchParams.set('cursor', cursor);
  const response = await fetch(endpoint, {
    headers: { 'User-Agent': 'chenglongma.github.io publication sync' },
    signal: AbortSignal.timeout(30_000)
  });
  if (!response.ok) throw new Error(`OpenAlex request failed: ${response.status} ${response.statusText}`);
  const page = await response.json();
  if (!page || typeof page !== 'object') throw new Error('OpenAlex returned an invalid works page.');
  const nextCursor = page.meta?.next_cursor;
  if (!Array.isArray(page.results) || page.results.some((work) => !work || typeof work !== 'object') ||
      (nextCursor !== null && (typeof nextCursor !== 'string' || !nextCursor))) {
    throw new Error('OpenAlex returned an invalid works page.');
  }
  results.push(...page.results);
  cursor = nextCursor;
}

const publications = [];
const rejected = [];
let metadataSkipped = 0;
let duplicatesSkipped = 0;
for (const work of results) {
  const doi = normalizeDoi(work.doi);
  if (!doi || !['article', 'conference-paper'].includes(text(work.type)) || !text(work.title) ||
      !Number.isInteger(work.publication_year) || work.publication_year <= 0 ||
      !Array.isArray(work.authorships) || !work.authorships.length || work.authorships.some((authorship) => !authorship || typeof authorship !== 'object')) {
    metadataSkipped++;
    continue;
  }
  if (existingDois.has(doi)) {
    duplicatesSkipped++;
    continue;
  }
  const assessments = work.authorships.map((authorship) => verifyAuthorship(authorship, { orcid, authorId }));
  const identity = assessments.find((assessment) => assessment.verified);
  if (!identity) {
    rejected.push({ work, reason: [...new Set(assessments.map((assessment) => assessment.reason))].join(' ') });
    continue;
  }
  publications.push({ work, reason: identity.reason });
  existingDois.add(doi);
}
publications.sort((left, right) => text(left.work.publication_date).localeCompare(text(right.work.publication_date)) || text(left.work.title).localeCompare(text(right.work.title)));

if (publications.length) {
  const entries = publications.map(({ work }) => publicationEntry(work, existingKeys)).join('\n');
  const updatedBibtex = `${bibtex.trimEnd()}\n\n${entries}`;
  validatePublications(updatedBibtex);
  await writeFile(bibPath, updatedBibtex);
}

const lines = [
  '# OpenAlex publication sync', '',
  'Review this PR before merging. A manual merge triggers the normal GitHub Pages deployment.', '',
  `Configured ORCID: ${orcid}; trusted OpenAlex author ID: ${authorId}.`,
  'Each addition must have a matching full name and either the trusted author ID or a matching raw ORCID on the same authorship. Conflicting raw ORCIDs are rejected; observed ORCIDs alone are not evidence.', '',
  `Fetched ${results.length} records across ${requestedCursors.size} page(s).`,
  `Skipped ${metadataSkipped} records for unsupported type or incomplete metadata, ${duplicatesSkipped} existing or duplicate DOIs, and ${rejected.length} candidates without verified identity.`, ''
];
if (!publications.length) {
  lines.push('No new verified journal articles or conference papers were found.');
} else {
  lines.push(`Added ${publications.length} publication${publications.length === 1 ? '' : 's'} to \`publications.bib\`.`, '');
  for (const { work, reason } of publications) lines.push(`- ${text(work.title)} (${work.publication_year}) — ${text(work.doi)}\n  - Identity evidence: ${reason}`);
}
if (rejected.length) {
  lines.push('', '## Candidates skipped because identity was not verified', '');
  for (const { work, reason } of rejected) {
    lines.push(`- ${text(work.title)} (${work.publication_year}) — ${text(work.doi)}\n  - Authors: ${work.authorships.map(authorName).filter(Boolean).join('; ')}\n  - Reason: ${reason}`);
  }
}
await writeFile(outputFile, `${lines.join('\n')}\n`);
console.log(`OpenAlex publication sync completed: ${publications.length} new publication(s).`);
