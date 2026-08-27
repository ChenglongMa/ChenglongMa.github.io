import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    keywords: z.array(z.string()),
    order: z.number()
  })
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    href: z.string().url(),
    github: z.string().url().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()),
    publicationKeys: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    date: z.coerce.date()
  })
});

const talks = defineCollection({
  loader: glob({ base: './src/content/talks', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    event: z.string(),
    eventUrl: z.string().url().optional(),
    location: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    abstract: z.string().optional(),
    publicationKey: z.string().optional(),
    paper: z.string().url().optional(),
    video: z.string().url().optional(),
    slides: z.string().optional(),
    poster: z.string().optional(),
    featured: z.boolean().default(false)
  })
});

const teaching = defineCollection({
  loader: glob({ base: './src/content/teaching', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    institution: z.string(),
    role: z.string(),
    period: z.string(),
    summary: z.string(),
    order: z.number()
  })
});

const awards = defineCollection({
  loader: glob({ base: './src/content/awards', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    issuer: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    hidden: z.boolean().default(false)
  })
});

export const collections = { research, projects, talks, teaching, awards };
