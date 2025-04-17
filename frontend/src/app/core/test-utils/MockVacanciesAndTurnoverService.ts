import { Injectable } from '@angular/core';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';

@Injectable()
export class MockVacanciesAndTurnoverService extends VacanciesAndTurnoverService {
  public static factory(overrides: any = {}) {
    return () => {
      const service = new MockVacanciesAndTurnoverService();

      Object.keys(overrides).forEach((overrideName) => {
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}
