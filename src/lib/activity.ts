import { getCollection } from 'astro:content';
import { getPublications } from './publications';

export type Activity = {
  date: Date;
  kind: 'Publication' | 'Project' | 'Talk' | 'Award';
  title: string;
  href: string;
};

export async function getActivities(): Promise<Activity[]> {
  const [publications, projects, talks, awards] = await Promise.all([
    getPublications(),
    getCollection('projects'),
    getCollection('talks'),
    getCollection('awards')
  ]);

  return [
    ...publications.map((publication) => ({
      date: new Date(publication.date || `${publication.year}-01-01`),
      kind: 'Publication' as const,
      title: publication.title,
      href: `/publication/${publication.id}/`
    })),
    ...projects.map((project) => ({
      date: project.data.date,
      kind: 'Project' as const,
      title: project.data.title,
      href: project.data.href
    })),
    ...talks.map((talk) => ({
      date: talk.data.date,
      kind: 'Talk' as const,
      title: talk.data.title,
      href: `/talks/${talk.id}/`
    })),
    ...awards.filter((award) => !award.data.hidden).map((award) => ({
      date: award.data.date,
      kind: 'Award' as const,
      title: award.data.title,
      href: '/awards/'
    }))
  ].sort((left, right) => right.date.valueOf() - left.date.valueOf());
}
