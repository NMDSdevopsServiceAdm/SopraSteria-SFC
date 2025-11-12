import { Pipe, PipeTransform } from '@angular/core';
import { StaffWhatKindDelegatedHealthcareActivities } from '@core/model/delegated-healthcare-activities.model';

@Pipe({
    name: 'formatWhatDHA',
    standalone: false
})
export class FormatWhatDhaPipe implements PipeTransform {
  transform(whatDHA: StaffWhatKindDelegatedHealthcareActivities): string | Array<string> {
    if (!whatDHA) {
      return '-';
    }

    const { knowWhatActivities } = whatDHA;

    return knowWhatActivities === "Don't know" ? 'Not known' : '-';
  }
}
