import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
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

  describe('rendering', () => {
    it('should display a page heading', async () => {
      const { getByRole } = await setup();
      const heading = getByRole('heading', { level: 1 });

      expect(heading.textContent).toEqual('Update your current staff vacancies');
    });

    it('should display a reveal text for "Why we ask for this information"', async () => {
      const { getByText } = await setup();

      const reveal = getByText('Why we ask for this information');
      const revealText = getByText(
        'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.',
      );

      expect(reveal).toBeTruthy();
      expect(revealText).toBeTruthy();
    });

    it('should display a warning text to remind about subtract or remove vacancies', async () => {
      const { getByTestId } = await setup();
      const warningText = getByTestId('warning-text');
      const expectedTextContent = 'Remember to SUBTRACT or REMOVE any that are no longer vacancies.';

      expect(warningText.textContent).toContain(expectedTextContent);
    });
  });
});
