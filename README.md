# Chenglong Ma

Source for [chenglongma.com](https://www.chenglongma.com), built with [Astro](https://astro.build/) and deployed as a static GitHub Pages site.

## Local development

Node.js 22.19 or newer is required.

```bash
npm install
npm run dev
```

Use `npm run build` for a production build, `npm run test:content` to validate the BibTeX source, and `npm run test:publications` for publication discovery regression tests.

## Maintaining content

- `publications.bib` is the canonical publication source. Commit an updated BibTeX file and the deployment workflow will validate it and render the updated list.
- `src/content/projects/`, `talks/`, `teaching/`, and `awards/` contain small Markdown files for the remaining sections.
- Put slides, posters, and CVs in `public/files/`, then reference their root-relative path (for example, `/files/posters/example.pdf`) from a content file.
- `src/data/publication-overrides.ts` associates a publication key with optional site-only material such as posters or project links, without changing the canonical BibTeX.

## Automated OpenAlex publication sync

On the first day of every month, the OpenAlex workflow discovers journal articles and conference papers using ORCID `0000-0002-6745-4029`. ORCID search results are candidates: OpenAlex can associate the same ORCID with unrelated author profiles through its `observed_orcids` list.

An addition must have the full name `Chenglong Ma` (or `Ma, Chenglong`) and either the trusted OpenAlex author ID `A5038674041` or a matching `raw_orcid` on the same authorship. A conflicting raw ORCID rejects that authorship. Original author names are preferred over resolved profile names when generating BibTeX. This preserves papers whose original author identity is correct even when OpenAlex assigns them to an unrelated profile. Changing `ORCID_ID` or `OPENALEX_AUTHOR_ID` does not change the full-name requirement.

The workflow reads every cursor page, deduplicates DOIs, validates the updated BibTeX, and creates a PR with identity evidence and reasons for skipped candidates. It also publishes the discovery report in the Actions summary. Review the PR before manually merging it; the merge triggers the normal GitHub Pages deployment. The discovery workflow does not merge or deploy changes. An API failure leaves both local output files unchanged, and papers absent from OpenAlex are never removed from the existing bibliography.

`OPENALEX_API_KEY` is used when configured as a repository Actions secret; a public API request is used for local runs. Run the same discovery locally with `npm run sync:publications`, then review `publications.bib` and the generated, ignored `openalex-discoveries.md` before committing. `npm run test:content` checks required fields, unique keys and DOIs, and the presence of Chenglong Ma among each entry's authors. Names alone cannot resolve every homonym; manual review remains necessary. If an unwanted item is proposed, review the underlying identity evidence and correct the matching rule before removing it, so a later sync does not add it again.
