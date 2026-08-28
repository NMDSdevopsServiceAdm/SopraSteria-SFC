import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { resetVacanciesAndTurnoverService } from './reset-vacancies-and-turnover-service.guard';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';

describe('resetVacanciesAndTurnoverService', () => {
  let vacanciesAndTurnoverService: jasmine.SpyObj<VacanciesAndTurnoverService>;

  const mockComponent = {};
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockCurrState = {} as RouterStateSnapshot;
  const mockNextState = {} as RouterStateSnapshot;

  beforeEach(() => {
    vacanciesAndTurnoverService = jasmine.createSpyObj(VacanciesAndTurnoverService, [
      'resetVisitedAndSubmittedPages',
      'clearAllSelectedJobRoles',
    ]);

    TestBed.configureTestingModule({
      providers: [{ provide: VacanciesAndTurnoverService, useValue: vacanciesAndTurnoverService }],
    });
  });

  it('should reset the states in VacanciesAndTurnoverService when exit from route', () => {
    const result = TestBed.runInInjectionContext(() =>
      resetVacanciesAndTurnoverService(mockComponent, mockRoute, mockCurrState, mockNextState),
    );

    expect(result).toBeTrue();
    expect(vacanciesAndTurnoverService.resetVisitedAndSubmittedPages).toHaveBeenCalled();
    expect(vacanciesAndTurnoverService.clearAllSelectedJobRoles).toHaveBeenCalled();
  });
});
