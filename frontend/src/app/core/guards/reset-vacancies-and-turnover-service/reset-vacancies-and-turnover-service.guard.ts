import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';

export const resetVacanciesAndTurnoverService: CanActivateFn = (_route, _state) => {
  const vacanciesAndTurnoverService = inject(VacanciesAndTurnoverService);
  vacanciesAndTurnoverService.clearAllSelectedJobRoles();
  vacanciesAndTurnoverService.resetVisitedAndSubmittedPages();

  return true;
};
