import { Pipe, PipeTransform } from '@angular/core';
import { StaffWhatKindDelegatedHealthcareActivities } from '@core/model/delegated-healthcare-activities.model';

@Pipe({
  name: 'formatWhatDHA',
})
export class FormatWhatDhaPipe implements PipeTransform {
  transform(whatDHA: StaffWhatKindDelegatedHealthcareActivities): string | Array<string> {
    if (!whatDHA) {
      return '-';
    }

    const { knowWhatActivities } = whatDHA;

    switch (knowWhatActivities) {
      case "Don't know":
        return 'Not known';

      default:
        return '-';
    }
  }
}
