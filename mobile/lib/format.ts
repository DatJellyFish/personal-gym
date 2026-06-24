export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatPace(paceMinPerKm: number): string {
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelative(iso: string): string {
  const now = Date.now();
  const d = new Date(iso).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'ontem';
  if (days < 7) return `${days} dias atrás`;
  return formatDate(iso);
}

export function typeLabel(type: string): string {
  switch (type) {
    case 'strength': return 'Musculação';
    case 'cardio': return 'Cardio';
    case 'mixed': return 'Misto';
    default: return type;
  }
}

export function activityLabel(a: string): string {
  const map: Record<string, string> = {
    running: 'Corrida',
    cycling: 'Ciclismo',
    walking: 'Caminhada',
    swimming: 'Natação',
    rowing: 'Remo',
    elliptical: 'Elíptico',
  };
  return map[a] || a;
}
