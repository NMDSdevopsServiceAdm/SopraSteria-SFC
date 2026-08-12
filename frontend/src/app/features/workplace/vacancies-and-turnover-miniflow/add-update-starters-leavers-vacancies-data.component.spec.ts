import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { AddUpdateStartersLeaversVacanciesDataComponent } from './add-update-starters-leavers-vacancies-data.component';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService, WorkplaceUpdateFlowType } from '@core/services/vacancies-and-turnover.service';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { AlertService } from '@core/services/alert.service';
import { provideActivatedRouteWithRouterLink } from '@core/test-utils/MockActivatedRoute';
import { BackLinkService } from '@core/services/backLink.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('AddUpdateStartersLeaversVacanciesDataComponent', () => {
  beforeAll(() => {
    jasmine.clock().install();
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });

  async function setup(overrides: any = {}) {
    const flowType = overrides.flowType ?? WorkplaceUpdateFlowType.ADD_SLV;
    const workplace = { ...establishmentBuilder(), ...overrides.workplace };
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
          snapshot: { data: { establishment: workplace, flowType } },
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

  it('should show a backlink', async () => {
    const { showBackLinkSpy } = await setup();
    expect(showBackLinkSpy).toHaveBeenCalled();
  });

  const mockJobs = [
    { jobId: 1, title: 'Care worker', total: 3 },
    { jobId: 2, title: 'Registered nurse', total: 2 },
  ];

  ['starters', 'leavers', 'vacancies'].forEach((slvKey) => {
    it(`should show a dash "-" with "Add" link when the value is empty for ${slvKey}`, async () => {
      const { getByTestId } = await setup();

      const row = getByTestId(slvKey);
      expect(row).toBeTruthy();
      expect(within(row).getByText('-')).toBeTruthy();

      const addLink = within(row).getByText('Add');
      expect(addLink.getAttribute('href')).toEqual(`/update-${slvKey}`);
    });

    it(`should show the current answer with "Change" link when got answer for ${slvKey}`, async () => {
      const { getByTestId } = await setup({ workplace: { [slvKey]: mockJobs } });

      const row = getByTestId(slvKey);
      expect(row).toBeTruthy();
      expect(within(row).queryByText(`3 x care worker`)).toBeTruthy();
      expect(within(row).queryByText('2 x registered nurse')).toBeTruthy();

      const changeLink = within(row).getByText('Change');
      expect(changeLink.getAttribute('href')).toEqual(`/update-${slvKey}`);
    });
  });

  it('should show "Starters since (date of one year ago)" for the starters row', async () => {
    jasmine.clock().mockDate(new Date('2027-12-25'));

    const { getByTestId } = await setup();

    const row = getByTestId('starters');
    expect(within(row).getByText('Starters since 25 December 2026')).toBeTruthy();
  });

  it('should show "leavers since (date of one year ago)" for the leavers row', async () => {
    jasmine.clock().mockDate(new Date('2027-08-12'));

    const { getByTestId } = await setup();

    const row = getByTestId('leavers');
    expect(within(row).getByText('Leavers since 12 August 2026')).toBeTruthy();
  });

  it('should show "Current staff vacancies" for the vacancies row', async () => {
    jasmine.clock().mockDate(new Date('2027-08-12'));

    const { getByTestId } = await setup();

    const row = getByTestId('vacancies');
    expect(within(row).getByText('Current staff vacancies')).toBeTruthy();
  });

  it('should show a Back to home button and a cancel link', async () => {
    const { getByRole, getByText, routerSpy } = await setup();

    const button = getByRole('button', { name: 'Back to home' });
    const cancelLink = getByText('Cancel');

    expect(cancelLink.getAttribute('href')).toContain('/dashboard#home');
    userEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
  });

  describe('Add flow', () => {
    it('should show a heading and caption', async () => {
      const { getByTestId, getByRole } = await setup({ flowType: WorkplaceUpdateFlowType.ADD_SLV });

      const caption = getByTestId('caption');
      const heading = getByRole('heading', { level: 1 });

      expect(within(caption).getByText('Workplace'));
      expect(within(heading).getByText('Add your starters, leavers and vacancy data'));
    });

    it('should show an alert on page load when starters leavers vacancies are all submitted', async () => {
      const { alertSpy } = await setup({
        flowType: WorkplaceUpdateFlowType.ADD_SLV,
        vacanciesAndTurnoverService: { allUpdatePagesSubmitted: () => true },
      });

      expect(alertSpy).toHaveBeenCalledWith({ type: 'success', message: 'Starters, leavers and vacancy data added' });
    });
  });
});
