# Chenglong Ma

Source for [chenglongma.com](https://www.chenglongma.com), built with [Astro](https://astro.build/) and deployed as a static GitHub Pages site.

## Local development

Node.js 22.19 or newer is required.

```bash
npm install
npm run dev
```

Use `npm run build` for a production build and `npm run test:content` to validate the BibTeX source.

## Maintaining content

- `publications.bib` is the canonical publication source. Commit an updated BibTeX file and the deployment workflow will validate it and render the updated list.
- `src/content/projects/`, `talks/`, `teaching/`, and `awards/` contain small Markdown files for the remaining sections.
- Put slides, posters, and CVs in `public/files/`, then reference their root-relative path (for example, `/files/posters/example.pdf`) from a content file.
- `src/data/publication-overrides.ts` associates a publication key with optional site-only material such as posters or project links, without changing the canonical BibTeX.

## Optional OpenAlex discovery

The weekly discovery workflow never edits `publications.bib`. It checks journal articles and conference papers associated with the configured ORCID and, when it finds a DOI that is not already in the bibliography, opens one review issue. `OPENALEX_API_KEY` is used when configured as a repository Actions secret; a public API request is used for local runs. Review suggestions and add approved entries to `publications.bib` yourself. Run one discovery locally with `npm run discover:publications`.
