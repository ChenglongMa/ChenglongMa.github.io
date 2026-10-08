import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import { isOwnName } from './publication-identity.mjs';

export function validatePublications(bibtex) {
  const publications = new Cite(bibtex).data;

  if (!publications.length) {
    throw new Error('publications.bib does not contain any readable BibTeX entries.');
  }

  const seenKeys = new Set();
  const seenDois = new Set();
  for (const publication of publications) {
    if (!publication.id || !publication.title || !publication.author?.length || !publication.issued?.['date-parts']?.[0]?.[0]) {
      throw new Error(`Incomplete publication data for BibTeX entry "${publication.id || 'unknown'}".`);
    }
    if (seenKeys.has(publication.id)) {
      throw new Error(`Duplicate BibTeX key "${publication.id}".`);
    }
    seenKeys.add(publication.id);

    const hasOwnAuthor = publication.author.some((author) => isOwnName(
      author.literal || [author.given, author['non-dropping-particle'], author.family].filter(Boolean).join(' ')
    ));
    if (!hasOwnAuthor) {
      throw new Error(`BibTeX entry "${publication.id}" does not include Chenglong Ma as an author.`);
    }

    const doi = String(publication.DOI || '').trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').toLowerCase();
    if (doi && seenDois.has(doi)) {
      throw new Error(`Duplicate DOI "${doi}" in BibTeX entry "${publication.id}".`);
    }
    if (doi) seenDois.add(doi);
  }
  return publications.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const bibtex = await readFile(new URL('../publications.bib', import.meta.url), 'utf8');
  const count = validatePublications(bibtex);
  console.log(`Validated ${count} publication${count === 1 ? '' : 's'} from publications.bib.`);
}
