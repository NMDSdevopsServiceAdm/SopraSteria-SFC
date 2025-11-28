import { Pipe, PipeTransform } from '@angular/core';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';
import { FormatUtil } from '@core/utils/format-util';

@Pipe({
    name: 'formatSLV',
    standalone: false
})
export class FormatStartersLeaversVacanciesPipe implements PipeTransform {
  transform(jobRole: Starter | Leaver | Vacancy): string {
    const lowerCaseTitle = FormatUtil.formatToLowercaseExcludingAcronyms(jobRole.title);
    if (jobRole.other?.length > 0) {
      return `${jobRole.total} x ${lowerCaseTitle}: ${jobRole.other?.toLowerCase()}`;
    }
    return `${jobRole.total} x ${lowerCaseTitle}`;
  }
}
