const text = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const normalizeOrcid = (value) => text(value).replace(/^https?:\/\/orcid\.org\//i, '').replace(/\/$/, '').toUpperCase();
const normalizeAuthorId = (value) => text(value).replace(/^https?:\/\/openalex\.org\//i, '').replace(/\/$/, '').toUpperCase();

export function isOwnName(value) {
  const name = text(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*,\s*/g, ', ')
    .toLowerCase();
  return name === 'chenglong ma' || name === 'ma, chenglong';
}

export function verifyAuthorship(authorship, { orcid, authorId }) {
  const rawName = text(authorship.raw_author_name);
  const rawOrcid = normalizeOrcid(authorship.raw_orcid);
  const expectedOrcid = normalizeOrcid(orcid);

  if (rawOrcid && rawOrcid !== expectedOrcid) {
    return { verified: false, reason: 'The raw ORCID conflicts with the configured ORCID.' };
  }
  if (rawOrcid === expectedOrcid && isOwnName(rawName)) {
    return { verified: true, reason: `Matching raw ORCID ${rawOrcid} and raw author name (${rawName}).` };
  }
  if (normalizeAuthorId(authorship.author?.id) === normalizeAuthorId(authorId)) {
    const name = rawName || text(authorship.author?.display_name);
    if (isOwnName(name)) {
      return { verified: true, reason: `Trusted OpenAlex author ID ${normalizeAuthorId(authorId)} and matching ${rawName ? 'raw' : 'profile'} author name (${name}).` };
    }
    return { verified: false, reason: 'The trusted OpenAlex author ID has a conflicting or missing author name.' };
  }
  if (rawOrcid === expectedOrcid) {
    return { verified: false, reason: 'The raw ORCID matches, but the raw full name does not.' };
  }
  return { verified: false, reason: 'No matching full name with a trusted author ID or matching raw ORCID.' };
}
