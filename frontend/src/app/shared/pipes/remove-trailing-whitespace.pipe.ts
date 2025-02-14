import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeTrailingWhitespace',
})
export class RemoveTrailingWhitespacePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? value.replace(/\s+$/, '') : '';
  }
}
