import { Pipe, PipeTransform } from '@angular/core';
import { CareWorkforcePathwayRoleCategory } from '@core/model/careWorkforcePathwayCategory.model';

@Pipe({
  name: 'CWPRoleCategoryTitle',
})
export class CareWorkforcePathwayRoleCategoryPipe implements PipeTransform {
  transform(value: CareWorkforcePathwayRoleCategory): string {
    if (!value) {
      return '-';
    }

    switch (value.title) {
      case 'I do not know':
        return 'Not known';

      case 'None of the above':
        return 'Role not included';

      default:
        return value.title;
    }
  }
}
