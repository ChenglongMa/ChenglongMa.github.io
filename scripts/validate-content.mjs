import { readFile } from 'node:fs/promises';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';

const bibtex = await readFile(new URL('../publications.bib', import.meta.url), 'utf8');
const publications = new Cite(bibtex).data;

if (!publications.length) {
  throw new Error('publications.bib does not contain any readable BibTeX entries.');
}

const seen = new Set();
for (const publication of publications) {
  if (!publication.id || !publication.title || !publication.author?.length || !publication.issued?.['date-parts']?.[0]?.[0]) {
    throw new Error(`Incomplete publication data for BibTeX entry "${publication.id || 'unknown'}".`);
  }
  if (seen.has(publication.id)) {
    throw new Error(`Duplicate BibTeX key "${publication.id}".`);
  }
  seen.add(publication.id);
}

console.log(`Validated ${publications.length} publication${publications.length === 1 ? '' : 's'} from publications.bib.`);
