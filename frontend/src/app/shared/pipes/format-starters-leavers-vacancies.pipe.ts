import { Pipe, PipeTransform } from '@angular/core';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';

@Pipe({
  name: 'formatSLV',
})
export class FormatStartersLeaversVacanciesPipe implements PipeTransform {
  transform(jobRole: Starter | Leaver | Vacancy): string {
    if (jobRole.other?.length > 0) {
      return `${jobRole.total} ${jobRole.title}: ${jobRole.other}`;
    }
    return `${jobRole.total} ${jobRole.title}`;
  }
}
