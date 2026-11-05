import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import {
  CareWorkforcePathwayService,
  CWPGetAllWorkersResponse,
  CWPGetWorkersWhoMeetNewToCareCriteriaResponse,
} from '@core/services/care-workforce-pathway.service';
import { WorkerService } from '@core/services/worker.service';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CareWorkforcePathwayNewToCareComponent } from './care-workforce-pathway-review-new-to-care.component';
import { MockCareWorkforcePathwayService } from '@core/test-utils/MockCareWorkforcePathwayService';

describe('CareWorkforcePathwayNewToCareComponent', () => {
  const mockWorkers: CWPGetAllWorkersResponse['workers'] = [
    {
      uid: 'worker-1',
      nameOrId: 'Test Worker',
      mainJob: { title: 'Care worker' },
      MainJobStartDateValue: '2024-01-10' as any,
      careWorkforcePathwayRoleCategory: {
        title: 'New to care',
        isNominatedIndividual: false,
      },
    },
    {
      uid: 'worker-2',
      nameOrId: 'Worker Without Start Date',
      mainJob: { title: 'Senior care worker' },
      MainJobStartDateValue: null as any,
      careWorkforcePathwayRoleCategory: {
        title: 'New to care',
        isNominatedIndividual: false,
      },
    },
  ] as CWPGetWorkersWhoMeetNewToCareCriteriaResponse['workers'];

  const setup = async (overrides: any = {}) => {
    const mockWorkersToShow = overrides.workersToShow ?? mockWorkers;
    const workerSummaryJourneyStartingPoint = overrides?.workerSummaryJourneyStartingPoint ?? 'home';

    const showBackLinkSpy = jasmine.createSpy('showBackLink');
    const setReturnToSpy = jasmine.createSpy('setReturnTo');
    const addAlertSpy = jasmine.createSpy('addAlert');
    const navigateSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    const routerStub = {
      url: '/workplace/mock-uid/staff-record/review-new-to-care',
      navigate: navigateSpy,
    };

    const result = await render(CareWorkforcePathwayNewToCareComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        {
          provide: BackLinkService,
          useValue: { showBackLink: showBackLinkSpy },
        },

        {
          provide: WorkerService,
          useValue: { setReturnTo: setReturnToSpy },
        },
        {
          provide: CareWorkforcePathwayService,
          useFactory: MockCareWorkforcePathwayService.factory({
            _workerSummaryJourneyStartingPoint: workerSummaryJourneyStartingPoint,
          }),
        },
        {
          provide: AlertService,
          useValue: { addAlert: addAlertSpy },
        },

        {
          provide: Router,
          useValue: routerStub,
        },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workersWhoMeetNewToCareCriteria: mockWorkersToShow,
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();

    return {
      ...result,
      component: result.fixture.componentInstance,
      backLinkService: injector.inject(BackLinkService),
      workerService: injector.inject(WorkerService),
      alertService: injector.inject(AlertService),
      careWorkforcePathwayService: injector.inject(CareWorkforcePathwayService),
      router: injector.inject(Router),
      showBackLinkSpy,
      setReturnToSpy,
      addAlertSpy,
      navigateSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the back link on initialisation', async () => {
    const { showBackLinkSpy } = await setup();

    expect(showBackLinkSpy).toHaveBeenCalled();
  });

  it('should display the page heading', async () => {
    const { getByRole, getByTestId } = await setup();

    expect(
      getByRole('heading', {
        level: 1,
        name: "Review whether these staff are still 'New to care'",
      }),
    ).toBeTruthy();

    expect(getByTestId('section-heading').textContent).toContain('Staff records');
  });

  it('should display a row for each worker', async () => {
    const { getByTestId } = await setup();

    mockWorkers.forEach((worker, index) => {
      const workerRow = getByTestId(`worker-row-${index}`);

      expect(within(workerRow).getByText(worker.nameOrId)).toBeTruthy();
      expect(within(workerRow).getByText(worker.mainJob.title!)).toBeTruthy();
    });
  });

  it('should format the worker start date', async () => {
    const { getByTestId } = await setup();

    const workerRow = getByTestId('worker-row-0');

    expect(within(workerRow).getByText('10 Jan 2024')).toBeTruthy();
  });

  it('should display a dash when the worker has no start date', async () => {
    const { getByTestId } = await setup();

    const workerRow = getByTestId('worker-row-1');

    expect(within(workerRow).getByText('-')).toBeTruthy();
  });

  it('should display a Change link for each worker', async () => {
    const { getByTestId } = await setup();

    mockWorkers.forEach((worker, index) => {
      const workerRow = getByTestId(`worker-row-${index}`);

      const changeLink = within(workerRow).getByText('Change', {
        selector: 'a',
      });

      expect(changeLink).toBeTruthy();
      expect(changeLink.textContent).toContain(`for ${worker.nameOrId}`);
    });
  });

  it('should set the current page as the return URL when Change is clicked', async () => {
    const { getByTestId, setReturnToSpy } = await setup();

    const workerRow = getByTestId('worker-row-0');
    const changeLink = within(workerRow).getByText('Change', {
      selector: 'a',
    });

    await userEvent.click(changeLink);

    expect(setReturnToSpy).toHaveBeenCalledWith({
      url: ['/workplace/mock-uid/staff-record/review-new-to-care'],
    });
  });

  it('should navigate to the dashboard when Return to home is clicked', async () => {
    const { getByText, navigateSpy } = await setup();

    userEvent.click(getByText('Return to home'));

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], {
      fragment: 'home',
    });
  });

  it('should display a success alert after navigating home', async () => {
    const { fixture, getByText, addAlertSpy } = await setup();

    userEvent.click(getByText('Return to home'));

    await fixture.whenStable();

    expect(addAlertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: 'Care Workforce Pathway role categories reviewed',
    });
  });

  it('should show a different return button when visited from staff records link', async () => {
    const { getByText, navigateSpy } = await setup({ workerSummaryJourneyStartingPoint: 'staff-records' });

    userEvent.click(getByText('Return to staff records'));

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], {
      fragment: 'staff-records',
    });
  });

  it('should redirect to the home tab when there are no workers to show', async () => {
    const { navigateSpy } = await setup({ workersToShow: [] });

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home', replaceUrl: true });
  });

  it('should redirect to the staff records tab when there are no workers to show and journey started from staff records tab', async () => {
    const { navigateSpy } = await setup({ workersToShow: [], workerSummaryJourneyStartingPoint: 'staff-records' });

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records', replaceUrl: true });
  });
});
