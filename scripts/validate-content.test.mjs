import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { validatePublications } from './validate-content.mjs';

function bibEntry({
  key,
  type = 'article',
  author = 'Ma, Chenglong',
  title = 'A publication',
  year = 2024,
  doi
}) {
  const fields = [
    `  author = {${author}}`,
    `  title = {${title}}`,
    `  year = {${year}}`
  ];
  if (doi !== undefined) fields.push(`  doi = {${doi}}`);
  return `@${type}{${key},\n${fields.join(',\n')}\n}`;
}

test('validator accepts genuine proceedings, articles, and misc entries', () => {
  const bibtex = [
    bibEntry({
      key: 'proceedings',
      type: 'inproceedings',
      author: 'Ma, Chenglong and Ren, Yongli',
      title: 'A proceedings paper',
      year: 2022,
      doi: '10.1000/proceedings'
    }),
    bibEntry({
      key: 'article',
      type: 'article',
      author: 'Ren, Yongli and Ma, Chenglong',
      title: 'A journal article',
      year: 2023,
      doi: '10.1000/article'
    }),
    bibEntry({
      key: 'misc',
      type: 'misc',
      author: 'Ma, Chenglong',
      title: 'A miscellaneous publication',
      year: 2021
    })
  ].join('\n\n');

  assert.equal(validatePublications(bibtex), 3);
});

test('validator accepts an author list with Chenglong Ma in the middle of 60 authors', () => {
  const authors = Array.from({ length: 60 }, (_, index) => `Researcher ${index + 1}`);
  authors[30] = 'Ma, Chenglong';
  const bibtex = bibEntry({
    key: 'sixty-authors',
    author: authors.join(' and '),
    title: 'A long author list',
    year: 2025
  });

  assert.equal(validatePublications(bibtex), 1);
});

test('validator rejects a publication without Chenglong Ma', () => {
  const bibtex = bibEntry({
    key: 'other-author',
    author: 'Smith, Alice and Jones, Bob',
    title: 'A publication by other authors'
  });

  assert.throws(() => validatePublications(bibtex), /Chenglong|author|identity/i);
});

test('validator rejects empty and incomplete input', () => {
  assert.throws(() => validatePublications(''), /empty|readable|publication/i);
  assert.throws(
    () => validatePublications('@article{incomplete,\n  title = {Only a title}\n}'),
    /incomplete|year|author|publication/i
  );
});

test('validator rejects duplicate BibTeX keys', () => {
  const bibtex = [
    bibEntry({ key: 'same-key', title: 'First title' }),
    bibEntry({ key: 'same-key', title: 'Second title', year: 2025 })
  ].join('\n\n');

  assert.throws(() => validatePublications(bibtex), /duplicate|key/i);
});

test('validator rejects duplicate DOIs after URL and case normalization', () => {
  const bibtex = [
    bibEntry({ key: 'doi-one', title: 'First DOI', doi: 'https://doi.org/10.1000/ABC' }),
    bibEntry({ key: 'doi-two', title: 'Second DOI', year: 2025, doi: '10.1000/abc' })
  ].join('\n\n');

  assert.throws(() => validatePublications(bibtex), /duplicate.*doi|doi.*duplicate/i);
});

test('validator accepts a publication with no DOI', () => {
  assert.equal(validatePublications(bibEntry({ key: 'no-doi', title: 'No DOI publication' })), 1);
});

test('importing the validator does not run its CLI', async () => {
  const temporaryDirectory = await mkdtemp(resolve(tmpdir(), 'validate-content-import-'));
  try {
    const moduleUrl = pathToFileURL(resolve(dirname(new URL(import.meta.url).pathname), 'validate-content.mjs')).href;
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', `await import(${JSON.stringify(moduleUrl)}); console.log('imported')`],
      { cwd: temporaryDirectory, encoding: 'utf8' }
    );

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'imported');
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
