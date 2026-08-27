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

## Automated OpenAlex publication sync

On the first day of every month, the OpenAlex workflow adds newly discovered journal articles and conference papers associated with the configured ORCID to `publications.bib`. It creates an auditable PR, automatically squash-merges it, then explicitly dispatches the GitHub Pages workflow so the site refreshes. `OPENALEX_API_KEY` is used when configured as a repository Actions secret; a public API request is used for local runs. If OpenAlex imports an unwanted item, delete its entry from `publications.bib`. Run the same sync locally with `npm run sync:publications`.
