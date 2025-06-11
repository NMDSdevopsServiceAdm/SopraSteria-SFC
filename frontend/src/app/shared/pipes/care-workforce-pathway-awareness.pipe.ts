import { Pipe, PipeTransform } from '@angular/core';
import { CareWorkforcePathwayWorkplaceAwarenessAnswer } from '@core/model/care-workforce-pathway.model';

@Pipe({
  name: 'CWPWorkplaceAwarenessTitle',
})
export class CareWorkforcePathwayWorkplaceAwarenessTitle implements PipeTransform {
  transform(value: CareWorkforcePathwayWorkplaceAwarenessAnswer): string {
    if (!value) {
      return '-';
    }

    switch (value.title) {
      case 'Aware of how the care workforce pathway works in practice':
        return 'Aware in practice';
      case 'Aware of the aims of the care workforce pathway':
        return 'Aware of the aims';
      case "Aware of the term 'care workforce pathway'":
        return 'Aware of the term';
      case 'Not aware of the care workforce pathway':
        return 'Not aware';
      case 'I do not know how aware our workplace is':
        return 'Not known';
      default:
        return value.title;
    }
  }
}
