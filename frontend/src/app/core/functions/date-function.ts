export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Il y a moins d\'1h';
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

interface DurationParts {
  jour?: number;
  heure?: number;
  minute?: number;
  seconde?: number;
}

export function toFormattedString({
  jour = 0,
  heure = 0,
  minute = 0,
  seconde = 0
}: DurationParts) {
  const totalHeures = (jour! * 24) + heure!;

  return `${pad(totalHeures)}:${pad(minute!)}:${pad(seconde!)}`;
}

export function parseDuration(stringDate: string) {
  const parts = stringDate.split(':').map(val => parseInt(val, 10) || 0);
  const [hh, mm, ss] = parts;

  const totalSeconds = (hh * 3600) + (mm * 60) + ss;

  return {
    isZero: totalSeconds === 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}