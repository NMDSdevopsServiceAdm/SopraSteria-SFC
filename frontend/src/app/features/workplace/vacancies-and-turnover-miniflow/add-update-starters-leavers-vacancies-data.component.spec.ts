import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { AddUpdateStartersLeaversVacanciesDataComponent } from './add-update-starters-leavers-vacancies-data.component';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { AlertService } from '@core/services/alert.service';
import { provideActivatedRouteWithRouterLink } from '@core/test-utils/MockActivatedRoute';
import { BackLinkService } from '@core/services/backLink.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { within } from '@testing-library/dom';

fdescribe('AddUpdateStartersLeaversVacanciesDataComponent', () => {
  async function setup(overrides: any = {}) {
    const workplace = { ...establishmentBuilder(), ...overrides.workplace };
    // const flowType = overrides?.flowType || WorkplaceUpdateFlowType.ADD;
    const totalNumberOfStaff = overrides?.totalNumberOfStaff ?? 10;
    const alertSpy = jasmine.createSpy('addAlert').and.returnValue(Promise.resolve(true));
    const showBackLinkSpy = jasmine.createSpy('setBacklink').and.returnValue(Promise.resolve(true));

    const setupTools = await render(AddUpdateStartersLeaversVacanciesDataComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useValue: { establishment: workplace },
        },
        {
          provide: VacanciesAndTurnoverService,
          useFactory: MockVacanciesAndTurnoverService.factory(overrides?.vacanciesAndTurnoverService),
        },
        {
          provide: AlertService,
          useValue: { addAlert: alertSpy },
        },
        provideActivatedRouteWithRouterLink({
          snapshot: { data: { totalNumberOfStaff, establishment: workplace } },
        }),
        {
          provide: BackLinkService,
          useValue: {
            showBackLink: showBackLinkSpy,
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');

    return {
      ...setupTools,
      component,
      workplace,
      router,
      routerSpy,
      alertSpy,
      showBackLinkSpy,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  const mockJobs = [
    { jobId: 1, title: 'Care workers', total: 3 },
    { jobId: 2, title: 'Registered nurse', total: 2 },
  ];
  //  component.workplace.vacancies = [
  //   { jobId: 1, title: 'Administrative', total: 3 },
  //   { jobId: 2, title: 'Nursing', total: 2 },
  //   { jobId: 3, title: 'Other care providing role', total: 4, other: 'Special care worker' },
  // ];
  // component.canEditEstablishment = true;
  // fixture.detectChanges();

  // const vacanciesRow = getByTestId('vacancies');

  // expect(within(vacanciesRow).queryByText('Change')).toBeTruthy();
  // expect(within(vacanciesRow).queryByText(`3 x administrative`)).toBeTruthy();
  // expect(within(vacanciesRow).queryByText('2 x nursing')).toBeTruthy();
  // expect(within(vacanciesRow).queryByText('4 x other care providing role: special care worker')).toBeTruthy();

  ['starters', 'leavers', 'vacancies'].forEach((slv) => {
    it(`should show a dash "-" with "Add" link when the value is empty for ${slv}`, async () => {
      const { getByTestId } = await setup();

      const row = getByTestId(slv);
      expect(row).toBeTruthy();
      expect(within(row).getByText('-')).toBeTruthy();

      const addLink = within(row).getByText('Add');
      expect(addLink.getAttribute('href')).toEqual(`/update-${slv}`);
    });
  });

  it('should show a Back to home button and a cancel button', async () => {});

  describe('Add flow', () => {
    it('should show a heading and caption', async () => {
      const { getByTestId, getByRole } = await setup();

      const caption = getByTestId('caption');
      const heading = getByRole('heading', { level: 1 });

      expect(within(caption).getByText('Workplace'));
      expect(within(heading).getByText('Add your starters, leavers and vacancy data'));
    });
  });
});
