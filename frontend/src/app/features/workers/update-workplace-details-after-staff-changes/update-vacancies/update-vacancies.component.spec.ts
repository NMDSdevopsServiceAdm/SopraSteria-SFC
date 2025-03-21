import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { MockUpdateWorkplaceAfterStaffChangesService } from '@core/test-utils/MockUpdateWorkplaceAfterStaffChangesService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { UpdateVacanciesComponent } from './update-vacancies.component';

fdescribe('UpdateVacanciesComponent', () => {
  const setup = async (override: any = {}) => {
    const setupTools = await render(UpdateVacanciesComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: UpdateWorkplaceAfterStaffChangesService,
          useFactory: MockUpdateWorkplaceAfterStaffChangesService.factory(),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const updateWorkplaceAfterStaffChangesService = injector.inject(
      UpdateWorkplaceAfterStaffChangesService,
    ) as UpdateWorkplaceAfterStaffChangesService;

    return {
      component,
      routerSpy,
      updateWorkplaceAfterStaffChangesService,
      ...setupTools,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
