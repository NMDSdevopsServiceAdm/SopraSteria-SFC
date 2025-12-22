import { Pipe, PipeTransform } from '@angular/core';

export const showCorrectTrainingValidity = (training: {
  validityPeriodInMonth?: number;
  doesNotExpire?: boolean;
}): string => {
  if (!training?.validityPeriodInMonth && !training?.doesNotExpire) {
    return '-';
  }

  if (training.validityPeriodInMonth > 1) {
    return `${training.validityPeriodInMonth} months`;
  } else if (training.validityPeriodInMonth === 1) {
    return `${training.validityPeriodInMonth} month`;
  } else if (training.doesNotExpire) {
    return 'Does not expire';
  }
};

@Pipe({
  name: 'showTrainingValidity',
  standalone: false,
})
export class ShowTrainingValidityPipe implements PipeTransform {
  transform(training: { validityPeriodInMonth: number; doesNotExpire: boolean }): string {
    return showCorrectTrainingValidity(training);
  }
}
