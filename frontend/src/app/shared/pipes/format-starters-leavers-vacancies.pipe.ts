import { Pipe, PipeTransform } from '@angular/core';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';

@Pipe({
  name: 'formatSLV',
})
export class FormatStartersLeaversVacanciesPipe implements PipeTransform {
  transform(jobRole: Starter | Leaver | Vacancy): string {
    const lowerCaseTitle = jobRole.title?.toLowerCase();
    if (jobRole.other?.length > 0) {
      return `${jobRole.total} x ${lowerCaseTitle}: ${jobRole.other?.toLowerCase()}`;
    }
    return `${jobRole.total} x ${lowerCaseTitle}`;
  }
}
