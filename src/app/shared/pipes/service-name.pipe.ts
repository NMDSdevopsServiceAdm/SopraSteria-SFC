import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'serviceName',
})
export class ServiceNamePipe implements PipeTransform {
  transform(value: string) {
    switch (value.toLowerCase()) {
      case 'domiciliary care services':
        return 'Domiciliary care';
      case 'care home services with nursing':
        return 'Care home with nursing';
      case 'care home services without nursing':
        return 'Care home without nursing';
    }
    return value;
  }
}
