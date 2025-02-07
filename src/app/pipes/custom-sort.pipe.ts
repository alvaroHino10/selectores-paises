import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'customSort',
  standalone: false,
})

export class CustomSortPipe implements PipeTransform {
  transform<T>(array: T[], criteria?: (a: T, b: T) => number): T[] {
    if (!Array.isArray(array)) {
      return array;
    }
    return criteria ? [...array].sort(criteria) : [...array].sort();
  }
}
