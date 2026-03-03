import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDuration',
})
export class TimeDurationPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Analyse "00:01:00"
    const parts = value.split(':');
    if (parts.length !== 3) return value; // Retourne l'original si format invalide

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    // Logique de transformation
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ' ' + minutes + 'mn' : ''}`;
    } else if (minutes > 0) {
      return `${minutes}mn${seconds > 0 ? ' ' + seconds + 's' : ''}`;
    } else {
      return `${seconds}s`;
    }
  }
}
