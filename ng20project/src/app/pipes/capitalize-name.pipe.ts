import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeName',
  standalone: true
})
export class CapitalizeNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    return value
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
}