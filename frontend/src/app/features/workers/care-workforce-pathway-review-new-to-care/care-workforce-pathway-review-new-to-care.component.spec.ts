import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { CareWorkforcePathwayService, CWPGetAllWorkersResponse } from '@core/services/care-workforce-pathway.service';
import { WorkerService } from '@core/services/worker.service';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CareWorkforcePathwayNewToCareComponent } from './care-workforce-pathway-review-new-to-care.component';

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
        isNominatedIndividual: true,
      },
    },
  ] as CWPGetAllWorkersResponse['workers'];

  const setup = async (overrides: any = {}) => {
    const workersResponse: CWPGetAllWorkersResponse = {
      workers: overrides.workers ?? mockWorkers,
      workerCount: overrides.workerCount ?? mockWorkers.length,
    };

    const getWorkersWhoMeetNewToCareCriteriaSpy = jasmine
      .createSpy('getWorkersWhoMeetNewToCareCriteria')
      .and.returnValue(overrides.workersToShow ?? workersResponse.workers);

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
          provide: AlertService,
          useValue: { addAlert: addAlertSpy },
        },
        {
          provide: CareWorkforcePathwayService,
          useValue: {
            getWorkersWhoMeetNewToCareCriteria: getWorkersWhoMeetNewToCareCriteriaSpy,
          },
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
                workersWhoRequireCWPAnswer: workersResponse,
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
      getWorkersWhoMeetNewToCareCriteriaSpy,
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

  it('should get workers who meet the New to care criteria', async () => {
    const { getWorkersWhoMeetNewToCareCriteriaSpy } = await setup();

    expect(getWorkersWhoMeetNewToCareCriteriaSpy).toHaveBeenCalledWith(mockWorkers);
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

  it('should display the nominated individual label when applicable', async () => {
    const { getByTestId } = await setup();

    const workerRow = getByTestId('worker-row-1');

    expect(within(workerRow).getByText('Nominated individual')).toBeTruthy();
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
    const { getByTestId, navigateSpy } = await setup();

    await userEvent.click(getByTestId('returnToHomeButton'));

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], {
      fragment: 'home',
    });
  });

  it('should display a success alert after navigating home', async () => {
    const { getByTestId, addAlertSpy } = await setup();

    await userEvent.click(getByTestId('returnToHomeButton'));

    expect(addAlertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: 'Care Workforce Pathway role categories reviewed',
    });
  });

  it('should not display the table when there are no workers to show', async () => {
    const { queryByRole } = await setup({ workersToShow: [] });

    expect(queryByRole('table')).toBeFalsy();
  });

  describe('formatMainStartDate', () => {
    it('should return an empty string when the date is null', async () => {
      const { component } = await setup();

      expect(component.formatMainStartDate(null)).toEqual('');
    });

    it('should format the date as D MMM YYYY', async () => {
      const { component } = await setup();

      expect(component.formatMainStartDate('2025-10-09')).toEqual('9 Oct 2025');
    });
  });
});
