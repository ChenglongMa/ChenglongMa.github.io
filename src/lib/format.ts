export function formatDate(value: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(date);
}

export function formatYear(value: Date | string | number) {
  return typeof value === 'number' ? String(value) : new Date(value).getFullYear().toString();
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]}.`)
    .join(' ');
}
