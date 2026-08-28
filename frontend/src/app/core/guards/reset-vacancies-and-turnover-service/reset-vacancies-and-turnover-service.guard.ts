import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn } from '@angular/router';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';

export const resetVacanciesAndTurnoverService: CanDeactivateFn<any> = (
  _component,
  _route,
  _currentState,
  _nextState,
) => {
  const vacanciesAndTurnoverService = inject(VacanciesAndTurnoverService);
  vacanciesAndTurnoverService.clearAllSelectedJobRoles();
  vacanciesAndTurnoverService.resetVisitedAndSubmittedPages();

  return true;
};
