import test from 'node:test';
import assert from 'node:assert/strict';

import { isOwnName, verifyAuthorship } from './publication-identity.mjs';

const ORCID = '0000-0002-6745-4029';
const AUTHOR_ID = 'A5038674041';
const OTHER_ORCID = '0000-0001-1111-1111';
const OTHER_AUTHOR_ID = 'A9999999999';

function assertIdentityResult(result, verified) {
  assert.equal(result.verified, verified);
  assert.equal(typeof result.reason, 'string');
  assert.ok(result.reason.trim(), 'identity verification should explain its decision');
}

function openAlexAuthor({ id = OTHER_AUTHOR_ID, displayName = 'C W', orcid, observedOrcids } = {}) {
  return {
    id: `https://openalex.org/${id}`,
    display_name: displayName,
    ...(orcid ? { orcid: `https://orcid.org/${orcid}` } : {}),
    ...(observedOrcids ? {
      observed_orcids: observedOrcids.map((value) => `https://orcid.org/${value}`)
    } : {})
  };
}

test('isOwnName normalizes case, whitespace, diacritics, and accepted order', () => {
  for (const value of [
    'Chenglong Ma',
    '  chenglong   ma  ',
    'CHENGLONG MA',
    'Ma, Chenglong',
    '  ma,\tchenglong  ',
    'Chénglóng Mǎ',
    'Ma, Chénglóng',
    `Chénglóng Ma`
  ]) {
    assert.equal(isOwnName(value), true, `expected own name: ${value}`);
  }
});

test('isOwnName rejects initials, partial names, and other full names', () => {
  for (const value of [
    'C W',
    'C. W.',
    'C W Ma',
    'Chenglong',
    'Ma',
    'Chenglong Wang',
    'Cheng Ma',
    'Ma, Chenglong Wang',
    'Wei Chenglong'
  ]) {
    assert.equal(isOwnName(value), false, `expected non-own name: ${value}`);
  }
});

test('raw ORCID and raw name verify one authorship despite a corrupted resolved author', () => {
  const result = verifyAuthorship({
    raw_orcid: `https://orcid.org/${ORCID}`,
    raw_author_name: 'Ma, Chenglong',
    author: openAlexAuthor({ id: 'A5074723125', displayName: 'C W', orcid: OTHER_ORCID })
  }, { orcid: ORCID, authorId: AUTHOR_ID });

  assertIdentityResult(result, true);
  assert.match(result.reason, /raw|orcid|name|verified/i);
});

test('trusted author ID verifies a matching raw name', () => {
  const result = verifyAuthorship({
    raw_author_name: 'Chenglong Ma',
    author: openAlexAuthor({ id: AUTHOR_ID, displayName: 'C W' })
  }, { orcid: ORCID, authorId: AUTHOR_ID });

  assertIdentityResult(result, true);
  assert.match(result.reason, /author|id|name|verified/i);
});

test('trusted author ID may use resolved display name only when raw name is absent', () => {
  const accepted = verifyAuthorship({
    author: openAlexAuthor({ id: AUTHOR_ID, displayName: 'Ma, Chenglong' })
  }, { orcid: ORCID, authorId: AUTHOR_ID });
  assertIdentityResult(accepted, true);

  const rejected = verifyAuthorship({
    author: openAlexAuthor({ id: AUTHOR_ID, displayName: 'C W' })
  }, { orcid: ORCID, authorId: AUTHOR_ID });
  assertIdentityResult(rejected, false);
});

test('a conflicting raw ORCID rejects the authorship even with trusted author ID', () => {
  const result = verifyAuthorship({
    raw_orcid: `https://orcid.org/${OTHER_ORCID}`,
    raw_author_name: 'Chenglong Ma',
    author: openAlexAuthor({ id: AUTHOR_ID, displayName: 'Chenglong Ma' })
  }, { orcid: ORCID, authorId: AUTHOR_ID });

  assertIdentityResult(result, false);
  assert.match(result.reason, /orcid|conflict|mismatch|identity/i);
});

test('observed ORCIDs and a resolved author ORCID alone do not prove identity', () => {
  const result = verifyAuthorship({
    author: openAlexAuthor({
      id: 'A5074723125',
      displayName: 'Chenglong Ma',
      orcid: ORCID,
      observedOrcids: [ORCID]
    })
  }, { orcid: ORCID, authorId: AUTHOR_ID });

  assertIdentityResult(result, false);
  assert.match(result.reason, /name|identity|author|verify/i);
});

test('ORCID evidence and name evidence from separate authorships cannot be combined', () => {
  const result = verifyAuthorship({
    raw_orcid: ORCID,
    raw_author_name: 'C W',
    author: openAlexAuthor({ id: 'A5074723125', displayName: 'C W' })
  }, { orcid: ORCID, authorId: AUTHOR_ID });

  assertIdentityResult(result, false);
});
