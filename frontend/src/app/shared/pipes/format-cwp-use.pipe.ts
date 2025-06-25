import { Pipe, PipeTransform } from '@angular/core';
import { CareWorkforcePathwayUse } from '../../core/model/care-workforce-pathway.model';

@Pipe({
  name: 'formatCWPUse',
})
export class FormatCwpUsePipe implements PipeTransform {
  transform(cwpUse: CareWorkforcePathwayUse): string | Array<string> {
    if (!cwpUse) {
      return '-';
    }

    const { use, reasons } = cwpUse;

    switch (use) {
      case 'No':
        return 'No';

      case "Don't know":
        return 'Not known';

      case 'Yes': {
        if (Array.isArray(reasons) && reasons.length > 0) {
          return this.getReasonTexts(reasons);
        }

        return 'Yes';
      }

      default:
        return '-';
    }
  }

  private getReasonTexts(reasons: CareWorkforcePathwayUse['reasons']): Array<string> {
    return reasons.map((reason) => {
      if (!reason.isOther) {
        return reason.text;
      }

      const otherText = reason.other;
      return otherText ?? 'To help with something else';
    });
  }
}
