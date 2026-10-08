import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./discover-openalex.mjs', import.meta.url));
const ORCID = '0000-0002-6745-4029';
const AUTHOR_ID = 'A5038674041';
const OTHER_ORCID = '0000-0001-1111-1111';
const OTHER_AUTHOR_ID = 'A9999999999';
const EXPECTED_FILTER = `authorships.author.orcid:${ORCID}`;

function author({
  id = OTHER_AUTHOR_ID,
  displayName = 'C W',
  orcid,
  observedOrcids,
  rawName,
  rawOrcid
} = {}) {
  const authorship = {
    author: {
      id: `https://openalex.org/${id}`,
      display_name: displayName,
      ...(orcid ? { orcid: `https://orcid.org/${orcid}` } : {}),
      ...(observedOrcids ? {
        observed_orcids: observedOrcids.map((value) => `https://orcid.org/${value}`)
      } : {})
    }
  };
  if (rawName !== undefined) authorship.raw_author_name = rawName;
  if (rawOrcid !== undefined) authorship.raw_orcid = rawOrcid;
  return authorship;
}

function work({
  doi,
  title = 'A test publication',
  year = 2025,
  type = 'article',
  authorships = [author({ id: AUTHOR_ID, displayName: 'C W', rawName: 'Ma, Chenglong' })]
} = {}) {
  return {
    id: `https://openalex.org/W${String(title || 'untitled').replace(/[^a-z0-9]/gi, '').slice(0, 20)}`,
    type,
    ...(title === undefined ? {} : { title }),
    ...(year === undefined ? {} : { publication_year: year, publication_date: `${year}-01-01` }),
    ...(doi === undefined ? {} : {
      doi: doi
        ? (/^https?:\/\//i.test(doi) ? doi : `https://doi.org/${doi}`)
        : doi
    }),
    authorships,
    primary_location: { source: { display_name: type === 'article' ? 'Test Journal' : 'Test Proceedings' } },
    biblio: { volume: '1', issue: '1', first_page: '1', last_page: '2' }
  };
}

function page(results, { expectedCursor = '*', nextCursor = null, status = 200, expectedPerPage = '100' } = {}) {
  return {
    expectedFilter: EXPECTED_FILTER,
    expectedCursor,
    expectedPerPage,
    status,
    body: { results, meta: { next_cursor: nextCursor } }
  };
}

function fetchPreload(pages) {
  const source = `
const pages = ${JSON.stringify(pages)};
let pageIndex = 0;
globalThis.fetch = async (input) => {
  const url = new URL(input);
  const page = pages[pageIndex];
  if (!page) throw new Error('unexpected extra OpenAlex request');
  if (page.expectedFilter !== undefined && url.searchParams.get('filter') !== page.expectedFilter) {
    throw new Error('unexpected OpenAlex filter: ' + url.searchParams.get('filter'));
  }
  if (page.expectedCursor !== undefined && url.searchParams.get('cursor') !== page.expectedCursor) {
    throw new Error('unexpected OpenAlex cursor: ' + url.searchParams.get('cursor'));
  }
  if (page.expectedPerPage !== undefined && url.searchParams.get('per-page') !== page.expectedPerPage) {
    throw new Error('unexpected OpenAlex page size: ' + url.searchParams.get('per-page'));
  }
  pageIndex += 1;
  if (page.error) throw new Error(page.error);
  return new Response(JSON.stringify(page.body), {
    status: page.status ?? 200,
    statusText: page.statusText ?? '',
    headers: { 'content-type': 'application/json' }
  });
};
`;
  return `data:text/javascript,${encodeURIComponent(source)}`;
}

function childEnvironment(overrides = {}, { useDefaults = false } = {}) {
  const environment = {
    ...process.env,
    ORCID_ID: ORCID,
    OPENALEX_AUTHOR_ID: AUTHOR_ID
  };
  if (useDefaults) {
    delete environment.ORCID_ID;
    delete environment.OPENALEX_AUTHOR_ID;
  }
  return { ...environment, ...overrides };
}

function runDiscover(directory, pages, overrides = {}, options = {}) {
  const result = spawnSync(
    process.execPath,
    ['--import', fetchPreload(pages), SCRIPT],
    {
      cwd: directory,
      env: childEnvironment(overrides, options),
      encoding: 'utf8'
    }
  );
  return {
    status: result.status,
    signal: result.signal,
    error: result.error,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

async function createCase({ bibtex = seedBib(), report = '# Existing report\n' } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'discover-openalex-'));
  await writeFile(join(directory, 'publications.bib'), bibtex);
  await writeFile(join(directory, 'openalex-discoveries.md'), report);
  return directory;
}

async function readOutputs(directory) {
  return {
    bibtex: await readFile(join(directory, 'publications.bib'), 'utf8'),
    report: await readFile(join(directory, 'openalex-discoveries.md'), 'utf8')
  };
}

function seedBib(doi = '10.1000/seed') {
  return `@article{seed,\n  author = {Ma, Chenglong},\n  title = {Seed publication},\n  year = {2020},\n  doi = {${doi}}\n}\n`;
}

function normalizedDoi(value) {
  return value.replace(/^https?:\/\/doi\.org\//i, '').toLowerCase();
}

function doiFields(bibtex) {
  return [...bibtex.matchAll(/\bdoi\s*=\s*\{([^}]*)\}/gi)].map((match) => normalizedDoi(match[1]));
}

function assertSuccessful(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function assertFailed(result) {
  assert.notEqual(result.status, 0, `expected failure; stdout=${result.stdout}; stderr=${result.stderr}`);
}

function reportBlock(report, title) {
  const lines = report.split('\n');
  const start = lines.findIndex((candidate) => candidate.startsWith(`- ${title} `));
  assert.notEqual(start, -1, `report should mention ${title}`);
  const block = [lines[start]];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('  - ')) break;
    block.push(line);
  }
  return block.join('\n');
}

test('skips a C W profile whose matching ORCID is only observed or resolved-author evidence', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const candidate = work({
      doi: '10.1000/wrong-cw',
      title: 'Wrong C W observed ORCID',
      authorships: [author({
        id: 'A5074723125',
        displayName: 'Chenglong Ma',
        orcid: OTHER_ORCID,
        observedOrcids: [ORCID]
      })]
    });
    const result = runDiscover(directory, [page([candidate])], {}, { useDefaults: true });
    assertSuccessful(result);
    const after = await readOutputs(directory);
    assert.equal(after.bibtex, before.bibtex);
    const block = reportBlock(after.report, 'Wrong C W observed ORCID');
    assert.match(block, /Authors:/);
    assert.match(block, /Reason:/);
    assert.match(block, /identity|author|verify|orcid/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('accepts a matching trusted author ID and writes the raw author name', async () => {
  const directory = await createCase();
  try {
    const candidate = work({
      doi: '10.1000/trusted-id',
      title: 'Trusted author ID publication',
      authorships: [author({ id: AUTHOR_ID, displayName: 'C W', rawName: 'Ma, Chenglong' })]
    });
    const result = runDiscover(directory, [page([candidate])]);
    assertSuccessful(result);
    const after = await readOutputs(directory);
    assert.match(after.bibtex, /10\.1000\/trusted-id/);
    assert.match(after.bibtex, /Ma, Chenglong|Chenglong Ma/);
    const block = reportBlock(after.report, 'Trusted author ID publication');
    assert.match(block, /Identity evidence:/);
    assert.match(block, new RegExp(AUTHOR_ID));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('accepts raw identity from a C W profile and serializes raw_author_name', async () => {
  const directory = await createCase();
  try {
    const candidate = work({
      doi: '10.1000/raw-cw',
      title: 'Raw identity C W publication',
      authorships: [author({
        id: 'A5074723125',
        displayName: 'C W',
        orcid: OTHER_ORCID,
        rawName: 'Ma, Chenglong',
        rawOrcid: `https://orcid.org/${ORCID}`
      })]
    });
    const result = runDiscover(directory, [page([candidate])]);
    assertSuccessful(result);
    const after = await readOutputs(directory);
    assert.match(after.bibtex, /10\.1000\/raw-cw/);
    assert.match(after.bibtex, /Ma, Chenglong|Chenglong Ma/);
    const addedAuthorField = [...after.bibtex.matchAll(/\bauthor\s*=\s*\{([^}]*)\}/gi)].at(-1)?.[1] || '';
    assert.doesNotMatch(addedAuthorField, /C W/);
    const block = reportBlock(after.report, 'Raw identity C W publication');
    assert.match(block, /Identity evidence:/);
    assert.match(block, new RegExp(ORCID));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('skips an identity conflict when raw ORCID disagrees with the trusted author ID', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const candidate = work({
      doi: '10.1000/conflict',
      title: 'Conflicting raw identity publication',
      authorships: [author({
        id: AUTHOR_ID,
        displayName: 'Chenglong Ma',
        rawName: 'Ma, Chenglong',
        rawOrcid: `https://orcid.org/${OTHER_ORCID}`
      })]
    });
    const result = runDiscover(directory, [page([candidate])]);
    assertSuccessful(result);
    const after = await readOutputs(directory);
    assert.equal(after.bibtex, before.bibtex);
    const block = reportBlock(after.report, 'Conflicting raw identity publication');
    assert.match(block, /Authors:/);
    assert.match(block, /Reason:/);
    assert.match(block, /conflict|mismatch|orcid|identity/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('does not combine identity signals from different authorships', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const candidate = work({
      doi: '10.1000/cross-author',
      title: 'Cross-author identity signals',
      authorships: [
        author({ id: 'A5074723125', displayName: 'C W', rawName: 'C W', rawOrcid: ORCID }),
        author({ id: OTHER_AUTHOR_ID, displayName: 'Ma, Chenglong', rawName: 'Ma, Chenglong' })
      ]
    });
    const result = runDiscover(directory, [page([candidate])]);
    assertSuccessful(result);
    const after = await readOutputs(directory);
    assert.equal(after.bibtex, before.bibtex);
    const block = reportBlock(after.report, 'Cross-author identity signals');
    assert.match(block, /Authors:/);
    assert.match(block, /Reason:/);
    assert.match(block, /skip|reject|identity|author|verify|orcid/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('deduplicates existing and batch DOIs and is byte-idempotent on repeated runs', async () => {
  const directory = await createCase({ bibtex: seedBib('10.1000/existing') });
  try {
    const candidates = [
      work({ doi: 'https://doi.org/10.1000/EXISTING', title: 'Existing DOI candidate' }),
      work({ doi: '10.1000/new-one', title: 'Batch DOI one' }),
      work({ doi: 'https://doi.org/10.1000/NEW-ONE', title: 'Batch DOI duplicate' }),
      work({ doi: '10.1000/new-two', title: 'Batch DOI two', type: 'conference-paper' })
    ];
    const pages = [page(candidates)];
    const first = runDiscover(directory, pages);
    assertSuccessful(first);
    const afterFirst = await readOutputs(directory);
    const firstDois = doiFields(afterFirst.bibtex);
    assert.equal(firstDois.length, 3);
    assert.equal(firstDois.filter((doi) => doi === '10.1000/existing').length, 1);
    assert.equal(firstDois.filter((doi) => doi === '10.1000/new-one').length, 1);
    assert.equal(firstDois.filter((doi) => doi === '10.1000/new-two').length, 1);
    assert.match(afterFirst.report, /Added 2 publications/);

    const second = runDiscover(directory, pages);
    assertSuccessful(second);
    const afterSecond = await readOutputs(directory);
    assert.equal(afterSecond.bibtex, afterFirst.bibtex);
    const third = runDiscover(directory, pages);
    assertSuccessful(third);
    const afterThird = await readOutputs(directory);
    assert.deepEqual(afterThird, afterSecond);
    assert.equal(doiFields(afterThird.bibtex).filter((doi) => doi === '10.1000/new-one').length, 1);
    assert.equal(doiFields(afterThird.bibtex).filter((doi) => doi === '10.1000/new-two').length, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('follows cursor pagination for more than one page of results', async () => {
  const directory = await createCase();
  try {
    const firstPage = Array.from({ length: 100 }, (_, index) => work({
      doi: `10.2000/page-one-${index + 1}`,
      title: `Pagination page one work ${index + 1}`
    }));
    const secondPage = [work({ doi: '10.2000/page-two-101', title: 'Pagination page two work 101' })];
    const result = runDiscover(directory, [
      page(firstPage, { expectedCursor: '*', nextCursor: 'cursor-two' }),
      page(secondPage, { expectedCursor: 'cursor-two', nextCursor: null })
    ]);
    assertSuccessful(result);
    const after = await readOutputs(directory);
    assert.match(after.bibtex, /10\.2000\/page-two-101/);
    assert.equal(doiFields(after.bibtex).filter((doi) => doi.startsWith('10.2000/page-')).length, 101);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('does not change either file when a later OpenAlex page returns HTTP failure', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const result = runDiscover(directory, [
      page([work({ doi: '10.3000/first-page', title: 'First page before HTTP failure' })], { nextCursor: 'second' }),
      { expectedFilter: EXPECTED_FILTER, expectedCursor: 'second', expectedPerPage: '100', status: 503, body: { error: 'unavailable' } }
    ]);
    assertFailed(result);
    assert.match(result.stderr + result.stdout, /503|OpenAlex|request|failed/i);
    assert.deepEqual(await readOutputs(directory), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('does not change either file when a later OpenAlex page is malformed', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const result = runDiscover(directory, [
      page([work({ doi: '10.3000/first-page-malformed', title: 'First page before malformed page' })], { nextCursor: 'second' }),
      {
        expectedFilter: EXPECTED_FILTER,
        expectedCursor: 'second',
        expectedPerPage: '100',
        status: 200,
        body: { results: { invalid: true }, meta: { next_cursor: null } }
      }
    ]);
    assertFailed(result);
    assert.match(result.stderr + result.stdout, /results|array|malformed|invalid|OpenAlex/i);
    assert.deepEqual(await readOutputs(directory), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects an invalid next_cursor value before changing files', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const result = runDiscover(directory, [{
      expectedFilter: EXPECTED_FILTER,
      expectedCursor: '*',
      expectedPerPage: '100',
      status: 200,
      body: { results: [], meta: { next_cursor: 42 } }
    }]);
    assertFailed(result);
    assert.match(result.stderr + result.stdout, /cursor|metadata|meta|invalid/i);
    assert.deepEqual(await readOutputs(directory), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects a repeated pagination cursor before changing files', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const result = runDiscover(directory, [
      page([], { expectedCursor: '*', nextCursor: 'repeat' }),
      page([], { expectedCursor: 'repeat', nextCursor: 'repeat' })
    ]);
    assertFailed(result);
    assert.match(result.stderr + result.stdout, /cursor|repeat|pagination/i);
    assert.deepEqual(await readOutputs(directory), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('skips works missing required metadata while adding eligible works and reporting the reason', async () => {
  const directory = await createCase();
  try {
    const missingDoi = work({ doi: undefined, title: 'Missing DOI metadata' });
    const missingTitle = work({ doi: '10.4000/missing-title' });
    delete missingTitle.title;
    const eligible = work({ doi: '10.4000/eligible', title: 'Eligible metadata work' });
    const result = runDiscover(directory, [page([missingDoi, missingTitle, eligible])]);
    assertSuccessful(result);
    const after = await readOutputs(directory);
    assert.match(after.bibtex, /10\.4000\/eligible/);
    assert.doesNotMatch(after.bibtex, /Missing DOI metadata|10\.4000\/missing-title/);
    assert.match(after.report, /Skipped 2 records for unsupported type or incomplete metadata/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects an invalid configured ORCID before making an API request', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const result = runDiscover(directory, [], { ORCID_ID: 'not-an-orcid' });
    assertFailed(result);
    assert.doesNotMatch(result.stderr + result.stdout, /unexpected extra|unexpected OpenAlex/);
    assert.match(result.stderr + result.stdout, /ORCID|invalid|configured/i);
    assert.deepEqual(await readOutputs(directory), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects an invalid configured OpenAlex author ID before making an API request', async () => {
  const directory = await createCase();
  const before = await readOutputs(directory);
  try {
    const result = runDiscover(directory, [], { OPENALEX_AUTHOR_ID: 'not-an-author-id' });
    assertFailed(result);
    assert.doesNotMatch(result.stderr + result.stdout, /unexpected extra|unexpected OpenAlex/);
    assert.match(result.stderr + result.stdout, /author|OpenAlex|invalid|configured/i);
    assert.deepEqual(await readOutputs(directory), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
