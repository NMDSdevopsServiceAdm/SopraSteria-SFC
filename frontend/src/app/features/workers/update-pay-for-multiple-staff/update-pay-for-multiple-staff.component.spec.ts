import { of, throwError } from 'rxjs';

import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkerWithPayData } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { build, fake, oneOf } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { render, screen } from '@testing-library/angular';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { AllJobs } from '../../../../mockdata/jobs';
import { UpdatePayForMultipleStaffComponent } from './update-pay-for-multiple-staff.component';

describe('UpdatePayForMultipleStaffComponent', () => {
  const workerBuilder = build('Worker', {
    fields: {
      uid: fake((f) => f.datatype.uuid()),
      nameOrId: fake((f) => f.name.findName() + f.datatype.uuid()),
      mainJob: oneOf(
        {
          id: 10,
          title: 'Care worker',
        },
        {
          id: 25,
          title: 'Senior care worker',
        },
      ),
      annualHourlyPay: oneOf(
        { value: 'Annually', rate: 25000 },
        { value: 'Hourly', rate: 12.5 },
        { value: "Don't know" },
        { value: null },
      ),
    },
  });

  const mockWorkers = [
    workerBuilder({ overrides: { annualHourlyPay: { value: 'Annually', rate: 25000 } } }),
    workerBuilder({ overrides: { annualHourlyPay: { value: 'Hourly', rate: 12.5 } } }),
    workerBuilder({ overrides: { annualHourlyPay: { value: "Don't know" } } }),
    workerBuilder({ overrides: { annualHourlyPay: { value: null } } }),
  ] as WorkerWithPayData[];

  const buildMultipleWorkers = (num: number, overrides = {}) => {
    return Array(num)
      .fill(null)
      .map(() => workerBuilder({ overrides })) as WorkerWithPayData[];
  };

  const payValues = ['Hourly', 'Annually', "Don't know"];
  const radioButtonLabels = ['Hourly', 'Salary', 'Not known'];
  const payValueToLabel = (payValue: string): string => radioButtonLabels[payValues.indexOf(payValue)];

  const getWorkerRow = (workerNameOrId: string): HTMLElement => {
    const table = screen.getByRole('table');
    return within(table).getByText(workerNameOrId).closest('[role="row"]') as HTMLElement;
  };

  const getErrorSummaryBox = (): HTMLElement => {
    return screen.getByText('There is a problem').parentElement!;
  };

  const expectWorkerTableToHaveData = (workerNameOrId: string, payOption: string, payRate: number) => {
    const row = getWorkerRow(workerNameOrId);
    expect(row).toBeTruthy();

    if (payOption) {
      const label = payValueToLabel(payOption);
      const radioButton = within(row).getByLabelText(label) as HTMLInputElement;
      expect(radioButton.checked).toBeTrue();
    } else {
      radioButtonLabels.forEach((label) => {
        const radioButton = within(row).getByLabelText(label) as HTMLInputElement;
        expect(radioButton.checked).toBeFalse();
      });
    }

    const payRateInputBox = within(row).getByLabelText(
      `Hourly pay rate or salary for ${workerNameOrId}`,
    ) as HTMLInputElement;

    let expectedInputBoxValue = '';
    if (payOption === 'Hourly') {
      expectedInputBoxValue = payRate.toFixed(2);
    } else if (payOption === 'Annually') {
      expectedInputBoxValue = payRate.toString();
    }
    expect(payRateInputBox.value).toEqual(expectedInputBoxValue);
  };

  const setup = async (overrides: any = {}) => {
    const pageOneWorkers = overrides?.pageOneWorkers ?? mockWorkers;
    const totalWorkerCount = overrides?.totalWorkerCount ?? pageOneWorkers.length;
    const mockWorkersWithPayData = { count: totalWorkerCount, workers: pageOneWorkers };
    const fastTrackPayByJobRolesViewed = overrides?.fastTrackPayByJobRolesViewed ?? false;

    const setuptools = await render(UpdatePayForMultipleStaffComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        WindowRef,
        AlertService,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory({
            establishment: { fastTrackPayByJobRolesViewed },
          }),
        },
        {
          provide: WorkerService,
          useClass: MockWorkerServiceWithOverrides,
        },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workersWithPayData: mockWorkersWithPayData,
                mainJobRoles: AllJobs,
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const fixture = setuptools.fixture;
    const component = fixture.componentInstance;
    fixture.autoDetectChanges();

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService);
    const updateSingleEstablishmentFieldSpy = spyOn(
      establishmentService,
      'updateSingleEstablishmentField',
    ).and.returnValue(of(null));
    const updateWorkersSpy = spyOn(establishmentService, 'updateWorkers').and.returnValue(of(null));

    const workerService = injector.inject(WorkerService);
    const clearWorkersGroupedByJobRoleSpy = spyOn(workerService, 'clearWorkersGroupedByJobRole');
    const getWorkersWithPayDataSpy = spyOn(workerService, 'getWorkersWithPayData');

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const route = injector.inject(ActivatedRoute) as ActivatedRoute;
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);

    return {
      ...setuptools,
      component,
      fixture,
      establishmentService,
      updateSingleEstablishmentFieldSpy,
      updateWorkersSpy,
      workerService,
      clearWorkersGroupedByJobRoleSpy,
      getWorkersWithPayDataSpy,
      alertServiceSpy,
      route,
      router,
      routerSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a h1 heading with caption', async () => {
    const { getByRole, getByText } = await setup();
    const h1HeadingText = 'Update pay for multiple staff';
    const caption = 'Staff records';

    expect(getByRole('heading', { level: 1, name: h1HeadingText })).toBeTruthy();
    expect(getByText(caption)).toBeTruthy();
  });

  it('should call clearWorkersGroupedByJobRole and set the data to null before the fast track page', async () => {
    const { clearWorkersGroupedByJobRoleSpy, component } = await setup();
    component.ngOnInit();
    expect(clearWorkersGroupedByJobRoleSpy).toHaveBeenCalled();
  });

  describe('link to fast-track-pay-updates page', async () => {
    const fastTrackLinkTestId = 'fast-track-pay-update-link';

    it('should show a link to fast-track-pay-updates page', async () => {
      const { route, getByTestId, routerSpy } = await setup();
      const expectedLinkText = 'Fast-track pay updates by job roles';

      const linkComponent = getByTestId(fastTrackLinkTestId);
      expect(linkComponent).toBeTruthy();

      const link = within(linkComponent).getByText(expectedLinkText);
      expect(link).toBeTruthy();

      userEvent.click(link);
      expect(routerSpy).toHaveBeenCalledWith(['../fast-track-pay-updates'], { relativeTo: route });
    });

    it('should show the link with a NEW pill if fastTrackPayByJobRolesViewed is false', async () => {
      const { getByTestId } = await setup({ fastTrackPayByJobRolesViewed: false });

      const linkComponent = getByTestId(fastTrackLinkTestId);
      const newPill = within(linkComponent).queryByTestId('new-pill');
      expect(newPill).toBeTruthy();
    });

    it('should not show the link with a NEW pill if fastTrackPayByJobRolesViewed is true', async () => {
      const { getByTestId } = await setup({ fastTrackPayByJobRolesViewed: true });

      const linkComponent = getByTestId(fastTrackLinkTestId);
      const newPill = within(linkComponent).queryByTestId('new-pill');
      expect(newPill).toBeFalsy();
    });

    it('should call to backend to set fastTrackPayByJobRolesViewed to true when fast track page link is clicked', async () => {
      const { fixture, getByText, updateSingleEstablishmentFieldSpy } = await setup();
      const expectedLinkText = 'Fast-track pay updates by job roles';

      const link = getByText(expectedLinkText);
      userEvent.click(link);

      await fixture.whenStable();

      expect(updateSingleEstablishmentFieldSpy).toHaveBeenCalledWith('mocked-uid', {
        property: 'fastTrackPayByJobRolesViewed',
        value: true,
      });
    });

    it('should not make the backend call if fastTrackPayByJobRolesViewed is already set to true', async () => {
      const { fixture, getByText, updateSingleEstablishmentFieldSpy } = await setup({
        fastTrackPayByJobRolesViewed: true,
      });
      const expectedLinkText = 'Fast-track pay updates by job roles';

      const link = getByText(expectedLinkText);
      userEvent.click(link);

      await fixture.whenStable();

      expect(updateSingleEstablishmentFieldSpy).not.toHaveBeenCalled();
    });
  });

  describe('workers table', () => {
    it('should show a table with the nameOrId, jobRole and pay for the workers', async () => {
      const { getByRole } = await setup();

      const workersTable = getByRole('table');

      expect(workersTable).toBeTruthy();
      mockWorkers.forEach((worker) => {
        const row = getWorkerRow(worker.nameOrId);
        expect(row).toBeTruthy();
        radioButtonLabels.forEach((label) => {
          expect(within(row).getByLabelText(label)).toBeTruthy();
        });
      });
    });

    it('should prefill the form with pay answers for existing workers', async () => {
      const { getByRole } = await setup();

      const workersTable = getByRole('table');

      expect(workersTable).toBeTruthy();

      mockWorkers.forEach((worker) => {
        expectWorkerTableToHaveData(worker.nameOrId, worker.annualHourlyPay.value, worker.annualHourlyPay.rate);
      });
    });

    it('should clear the pay rate when "Not known" is selected', async () => {
      const { fixture, getByRole } = await setup();

      const workersTable = getByRole('table');
      const workerRow = getWorkerRow(mockWorkers[3].nameOrId);

      const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;
      userEvent.type(payRateInputBox, '25000');

      expect(payRateInputBox.value).toEqual('25000');

      userEvent.click(within(workerRow).getByLabelText('Not known'));
      fixture.detectChanges();

      expect(payRateInputBox.value).toEqual('');
    });

    it('should clear the "Not known" radio button when user type in pay rate', async () => {
      const { fixture } = await setup();

      const workerRow = getWorkerRow(mockWorkers[3].nameOrId);

      const notKnownRadioButton = within(workerRow).getByLabelText('Not known') as HTMLInputElement;
      const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;

      userEvent.click(notKnownRadioButton);

      expect(notKnownRadioButton.checked).toBeTrue();

      userEvent.type(payRateInputBox, '25000');
      fixture.detectChanges();

      expect(payRateInputBox.value).toEqual('25000');
      expect(notKnownRadioButton.checked).toBeFalse();
    });

    ['Hourly', 'Salary'].forEach((radioButtonLabel) => {
      it(`should not clear the pay rate when ${radioButtonLabel} is selected`, async () => {
        const { fixture } = await setup();

        const workerRow = getWorkerRow(mockWorkers[3].nameOrId);

        const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;
        userEvent.type(payRateInputBox, '25000');

        expect(payRateInputBox.value).toEqual('25000');

        userEvent.click(within(workerRow).getByLabelText(radioButtonLabel));
        fixture.detectChanges();

        expect(payRateInputBox.value).toEqual('25000');
      });

      it(`should not clear the ${radioButtonLabel} radio button when user type in pay rate`, async () => {
        const { fixture } = await setup();

        const workerRow = getWorkerRow(mockWorkers[3].nameOrId);

        const radioButton = within(workerRow).getByLabelText(radioButtonLabel) as HTMLInputElement;
        const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;

        userEvent.click(radioButton);
        expect(radioButton.checked).toBeTrue();

        userEvent.type(payRateInputBox, '25000');
        fixture.detectChanges();

        expect(payRateInputBox.value).toEqual('25000');
        expect(radioButton.checked).toBeTrue();
      });
    });
  });

  describe('sorting, pagination and search', () => {
    const mockPageOneWorkers = buildMultipleWorkers(15);
    const mockPageTwoWorkers = buildMultipleWorkers(15);
    const mockPageThreeWorkers = buildMultipleWorkers(2);
    const pages = [mockPageOneWorkers, mockPageTwoWorkers, mockPageThreeWorkers];

    it('should show a sort by select box if more than one worker', async () => {
      const { getByLabelText } = await setup();

      const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
      expect(sortBySelectBox).toBeTruthy();

      const expectedOptions = ['Staff name (A to Z)', 'Staff name (Z to A)', 'Job role (A to Z)', 'Job role (Z to A)'];
      within(sortBySelectBox).getByText('Staff name (A to Z)');
      expectedOptions.forEach((option) => {
        expect(within(sortBySelectBox).getByText(option)).toBeTruthy();
      });
    });

    it('should not show the sort by select box if only one worker', async () => {
      const { queryByLabelText } = await setup({ pageOneWorkers: [workerBuilder()] });
      const sortBySelectBox = queryByLabelText('Sort by') as HTMLSelectElement;
      expect(sortBySelectBox).toBeFalsy();
    });

    it('should fetch and update workers when user select another sortBy option', async () => {
      const { fixture, getByText, getByTestId, getByLabelText, getWorkersWithPayDataSpy } = await setup();

      getWorkersWithPayDataSpy.and.returnValue(of({ count: 4, workers: [...mockWorkers].reverse() }));

      const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
      expect(sortBySelectBox).toBeTruthy();

      userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));

      expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mocked-uid', {
        pageIndex: 0,
        itemsPerPage: 15,
        sortBy: 'staffNameDesc',
      });

      await fixture.whenStable();

      expect(getByTestId('worker-row-0').textContent).toContain(mockWorkers[3].nameOrId);
      expect(getByTestId('worker-row-1').textContent).toContain(mockWorkers[2].nameOrId);
      expect(getByTestId('worker-row-2').textContent).toContain(mockWorkers[1].nameOrId);
      expect(getByTestId('worker-row-3').textContent).toContain(mockWorkers[0].nameOrId);
    });

    it('should show a search bar and pagination footer when there are more than 15 workers', async () => {
      const { queryByLabelText, queryByTestId } = await setup({
        totalWorkerCount: 32,
      });

      const searchInput = queryByLabelText(/Search by job role/);
      expect(searchInput).toBeTruthy();

      const footer = queryByTestId('pagination-footer');
      expect(footer).toBeTruthy();

      expect(queryByTestId('pageNoLink-0')).toBeFalsy();
      expect(queryByTestId('pageNoText-0')).toBeTruthy();
      expect(queryByTestId('pageNoLink-1')).toBeTruthy();
      expect(queryByTestId('pageNoLink-2')).toBeTruthy();
    });

    it('should not show search bar and pagination footer when there are exactly 15 workers', async () => {
      const { queryByLabelText, queryByTestId } = await setup({ totalWorkerCount: 15 });

      const searchInput = queryByLabelText(/Search by job role/);
      expect(searchInput).toBeFalsy();

      const footer = queryByTestId('pagination-footer');
      expect(footer).toBeFalsy();
    });

    it('should not show search bar and pagination footer when there are less than 14 workers', async () => {
      const { queryByLabelText, queryByTestId } = await setup({ totalWorkerCount: 14 });

      const searchInput = queryByLabelText(/Search by job role/);
      expect(searchInput).toBeFalsy();

      const footer = queryByTestId('pagination-footer');
      expect(footer).toBeFalsy();
    });

    it('should fetch and update workers when page number link is clicked', async () => {
      const { fixture, getByRole, queryByText, queryByTestId, getWorkersWithPayDataSpy } = await setup({
        pageOneWorkers: mockPageOneWorkers,
        totalWorkerCount: 32,
      });

      getWorkersWithPayDataSpy.and.callFake((_uid, params) => {
        const pageIndex = params?.pageIndex;
        return of({ count: 32, workers: pages[pageIndex] });
      });

      userEvent.click(queryByTestId('pageNoLink-1')!);
      await fixture.whenStable();

      expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mocked-uid', {
        pageIndex: 1,
        itemsPerPage: 15,
        sortBy: 'staffNameAsc',
      });

      mockPageTwoWorkers.forEach((worker) => {
        expectWorkerTableToHaveData(worker.nameOrId, worker.annualHourlyPay.value, worker.annualHourlyPay.rate);
      });

      expect(queryByText(mockPageOneWorkers[0].nameOrId)).toBeFalsy();

      expect(queryByTestId('pageNoLink-0')).toBeTruthy();
      expect(queryByTestId('pageNoLink-1')).toBeFalsy();
      expect(queryByTestId('pageNoText-1')).toBeTruthy();
      expect(queryByTestId('pageNoLink-2')).toBeTruthy();
    });

    describe('search by job role name', async () => {
      it('should show a search box when total count of workers is more than 15 (a single page)', async () => {
        const { queryAllByLabelText } = await setup({
          totalWorkerCount: 16,
        });

        const searchBox = queryAllByLabelText(/Search by job role/);
        expect(searchBox).toBeTruthy();
      });

      it('should not show the search box when total count of workers is less than 15', async () => {
        const { queryByLabelText } = await setup({
          totalWorkerCount: 14,
        });

        const searchBox = queryByLabelText(/Search by job role/);
        expect(searchBox).toBeFalsy();
      });

      it('should not show the search box when total count of workers is exactly 15', async () => {
        const { queryByLabelText } = await setup({
          totalWorkerCount: 15,
        });

        const searchBox = queryByLabelText(/Search by job role/);
        expect(searchBox).toBeFalsy();
      });

      it('should display suggestions when user type in part of a job role name', async () => {
        const { queryByLabelText } = await setup({
          totalWorkerCount: 16,
        });

        const searchBox = queryByLabelText(/Search by job role/)!;
        userEvent.type(searchBox, 'Care');

        const searchBoxWrapper = searchBox.parentElement!;

        expect(within(searchBoxWrapper).getByText('Care worker')).toBeTruthy();
        expect(within(searchBoxWrapper).getByText('Senior care worker')).toBeTruthy();
        expect(within(searchBoxWrapper).queryByText('Registered nurse')).toBeFalsy();
      });

      const jobIdOfSeniorCareWorker = AllJobs.find((job) => job.title === 'Senior care worker')?.id;

      it('should search workers with given job role id, when a job role name suggestion is clicked', async () => {
        const { fixture, queryByLabelText, getWorkersWithPayDataSpy } = await setup({
          totalWorkerCount: 16,
        });

        getWorkersWithPayDataSpy.and.callFake((_uid) => {
          return of({ count: 3, workers: mockWorkers.slice(3) });
        });

        const searchBox = queryByLabelText(/Search by job role/)!;
        userEvent.type(searchBox, 'Care');
        const searchBoxWrapper = searchBox.parentElement!;

        userEvent.click(within(searchBoxWrapper).getByText('Senior care worker'));

        await fixture.whenStable();

        expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mocked-uid', {
          pageIndex: 0,
          itemsPerPage: 15,
          sortBy: 'staffNameAsc',
          jobId: jobIdOfSeniorCareWorker,
        });
      });

      it('should search with pageIndex = 0 and the current sortBy setting', async () => {
        const { fixture, getByText, getByLabelText, getWorkersWithPayDataSpy, getByTestId } = await setup({
          totalWorkerCount: 16,
        });

        getWorkersWithPayDataSpy.and.callFake((_uid) => {
          return of({ count: 16, workers: mockWorkers.slice(3) });
        });

        // sort by staff name desc and then go to page 2
        const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
        userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));
        userEvent.click(getByTestId('pageNoLink-1'));
        await fixture.whenStable();

        const searchBox = getByLabelText(/Search by job role/)!;
        userEvent.type(searchBox, 'Care');
        const searchBoxWrapper = searchBox.parentElement!;

        getWorkersWithPayDataSpy.calls.reset();

        userEvent.click(within(searchBoxWrapper).getByText('Senior care worker'));

        await fixture.whenStable();

        expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mocked-uid', {
          pageIndex: 0,
          itemsPerPage: 15,
          sortBy: 'staffNameDesc',
          jobId: jobIdOfSeniorCareWorker,
        });
      });

      it('should show a "Clear search results" link when job role filter is active', async () => {
        const { getByText, getByLabelText, getWorkersWithPayDataSpy } = await setup({
          totalWorkerCount: 16,
        });

        getWorkersWithPayDataSpy.and.callFake((_uid) => {
          return of({ count: 16, workers: mockWorkers });
        });

        const searchBox = getByLabelText(/Search by job role/) as HTMLInputElement;
        userEvent.type(searchBox, 'Care');
        const searchBoxWrapper = searchBox.parentElement!;
        userEvent.click(within(searchBoxWrapper).getByText('Senior care worker'));

        getWorkersWithPayDataSpy.calls.reset();

        const clearSearchResultsLink = getByText('Clear search results');
        expect(clearSearchResultsLink).toBeTruthy();

        userEvent.click(clearSearchResultsLink);

        expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mocked-uid', {
          pageIndex: 0,
          itemsPerPage: 15,
          sortBy: 'staffNameAsc',
        });

        expect(searchBox.value).toEqual('');
      });

      it('when job role filter is active, page change and sort by change should keep the job role id in search', async () => {
        const { fixture, getByText, getByLabelText, getWorkersWithPayDataSpy, queryByTestId } = await setup({
          totalWorkerCount: 16,
        });

        getWorkersWithPayDataSpy.and.callFake((_uid) => {
          return of({ count: 16, workers: mockWorkers });
        });

        // search by job role first
        const searchBox = getByLabelText(/Search by job role/)!;
        userEvent.type(searchBox, 'Care');
        const searchBoxWrapper = searchBox.parentElement!;

        userEvent.click(within(searchBoxWrapper).getByText('Senior care worker'));
        getWorkersWithPayDataSpy.calls.reset();

        // sort by staff name desc
        const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
        userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));

        await fixture.whenStable();

        expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mocked-uid', {
          pageIndex: 0,
          itemsPerPage: 15,
          sortBy: 'staffNameDesc',
          jobId: jobIdOfSeniorCareWorker,
        });

        // click page 2
        getWorkersWithPayDataSpy.calls.reset();
        userEvent.click(queryByTestId('pageNoLink-1')!);

        await fixture.whenStable();

        expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mocked-uid', {
          pageIndex: 1,
          itemsPerPage: 15,
          sortBy: 'staffNameDesc',
          jobId: jobIdOfSeniorCareWorker,
        });
      });
    });

    it('should show a message about no matching result if no workers were found', async () => {
      const { fixture, getByLabelText, getByText, getWorkersWithPayDataSpy } = await setup({
        totalWorkerCount: 16,
      });

      getWorkersWithPayDataSpy.and.callFake((_uid) => {
        return of({ count: 0, workers: [] });
      });

      const searchBox = getByLabelText(/Search by job role/)!;
      userEvent.type(searchBox, 'Care');
      const searchBoxWrapper = searchBox.parentElement!;

      userEvent.click(within(searchBoxWrapper).getByText('Senior care worker'));
      await fixture.whenStable();

      expect(getByText('There are no matching results')).toBeTruthy();
    });

    // it('should handle server error when loading worker', async () => {
    //   const errorResponse = new HttpErrorResponse({
    //     status: 500,
    //   });
    //   const { fixture, getByText, getByLabelText, getWorkersWithPayDataSpy } = await setup();

    //   getWorkersWithPayDataSpy.and.returnValue(throwError(errorResponse));

    //   const searchBox = getByLabelText(/Search by job role/)!;
    //   userEvent.type(searchBox, 'Care');
    //   const searchBoxWrapper = searchBox.parentElement!;

    //   userEvent.click(within(searchBoxWrapper).getByText('Senior care worker'));
    //   await fixture.whenStable();

    //   expect(getByText('There is a problem')).toBeTruthy();
    //   // expect(getByText('Failed to load workers')).toBeTruthy();
    // });
  });

  describe('jobRoleDataProvider', () => {
    it('should return a function that generate suggestion for auto-complete child component', async () => {
      const { component } = await setup();

      const dataProvider = component.jobRoleDataProvider();
      const suggestions = dataProvider('care');

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions).toContain('Care worker');
      expect(suggestions).toContain('Senior care worker');
    });

    it('should return the suggestions in alphabetic order, except the job roles that match at the start should come first', async () => {
      const { component } = await setup();

      const dataProvider = component.jobRoleDataProvider();

      const searchedByCare = dataProvider('care');

      const expectedJobRolesOrder = [
        'Care coordinator',
        'Care worker',
        'Administrative, office staff (non care-providing)',
        'Ancillary staff (non care-providing)',
        'Managers and staff (care-related, but not care-providing)',
        'Other (directly involved in providing care)',
        'Other (not directly involved in providing care)',
        'Senior care worker',
      ];

      expect(searchedByCare).toEqual(expectedJobRolesOrder);

      const searchedByManage = dataProvider('manage');

      const expectedJobRolesOrder2 = [
        'Managers and staff (care-related, but not care-providing)',
        'Data governance manager',
        'Deputy manager',
        'First-line manager',
        'IT manager',
        'IT service desk manager',
        'Middle management',
        'Registered Manager',
        'Senior management',
      ];

      expect(searchedByManage).toEqual(expectedJobRolesOrder2);
    });
  });

  describe('form submit', () => {
    it('should show a "Save and return" CTA button and a cancel link', async () => {
      const { getByRole, getByText } = await setup();

      const submitButton = getByRole('button', { name: 'Save and return' });
      expect(submitButton).toBeTruthy();

      const cancelLink = getByText('Cancel');
      expect(cancelLink).toBeTruthy();
    });

    it('should return to dashboard staff records page on cancel', async () => {
      const { getByText, routerSpy } = await setup();

      const cancelLink = getByText('Cancel');
      userEvent.click(cancelLink);

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
    });

    it('should return to dashboard staff records page when user submit without making any change', async () => {
      const { fixture, getByRole, routerSpy, alertServiceSpy, updateWorkersSpy } = await setup();

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
      expect(updateWorkersSpy).not.toHaveBeenCalled();
      expect(alertServiceSpy).not.toHaveBeenCalled();
    });

    it('should call updateWorkers with the pay updates on submit', async () => {
      const expectedPayload = [{ uid: mockWorkers[3].uid, annualHourlyPay: { value: 'Annually', rate: 25000 } }];

      const { fixture, getByRole, updateWorkersSpy, routerSpy, alertServiceSpy } = await setup();

      const workerRow = getWorkerRow(mockWorkers[3].nameOrId);

      const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;
      userEvent.click(within(workerRow).getByLabelText('Salary'));
      userEvent.type(payRateInputBox, '25000');

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(updateWorkersSpy).toHaveBeenCalledWith('mocked-uid', expectedPayload);

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
      expect(alertServiceSpy).toHaveBeenCalledWith({ type: 'success', message: 'Pay updated in 1 staff record' });
    });

    it('should ignore the change to a worker if user cleared the input in form', async () => {
      const { fixture, getByRole, updateWorkersSpy, routerSpy, alertServiceSpy } = await setup();

      const workerRow = getWorkerRow(mockWorkers[3].nameOrId);

      const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;
      userEvent.type(payRateInputBox, '25000');
      userEvent.clear(payRateInputBox);

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });

      expect(updateWorkersSpy).not.toHaveBeenCalled();
      expect(alertServiceSpy).not.toHaveBeenCalled();
    });

    it('should handle the update for workers across different pages', async () => {
      const mockWorkers = buildMultipleWorkers(32, { annualHourlyPay: { value: null } });
      const pages = [mockWorkers.slice(0, 15), mockWorkers.slice(15, 30), mockWorkers.slice(30)];

      const { fixture, getByRole, getByTestId, updateWorkersSpy, alertServiceSpy, getWorkersWithPayDataSpy } =
        await setup({
          pageOneWorkers: pages[0],
          totalWorkerCount: 32,
        });

      getWorkersWithPayDataSpy.and.callFake((_uid, params) => {
        const pageIndex = params?.pageIndex;
        return of({ count: 32, workers: pages[pageIndex] });
      });

      const workerRow = getWorkerRow(mockWorkers[3].nameOrId);
      userEvent.click(within(workerRow).getByLabelText('Salary'));
      userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '25000');

      const workerRow2 = getWorkerRow(mockWorkers[13].nameOrId);
      userEvent.click(within(workerRow2).getByLabelText('Not known'));

      // click page 2
      userEvent.click(getByTestId('pageNoLink-1')!);
      await fixture.whenStable();

      const workerRow3 = getWorkerRow(mockWorkers[23].nameOrId);
      userEvent.click(within(workerRow3).getByLabelText('Hourly'));
      userEvent.type(within(workerRow3).getByLabelText(/Hourly pay rate or salary/), '25.5');

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      const expectedPayload = [
        { uid: mockWorkers[3].uid, annualHourlyPay: { value: 'Annually', rate: 25000 } },
        { uid: mockWorkers[13].uid, annualHourlyPay: { value: "Don't know", rate: null } },
        { uid: mockWorkers[23].uid, annualHourlyPay: { value: 'Hourly', rate: 25.5 } },
      ];
      expect(updateWorkersSpy).toHaveBeenCalledWith('mocked-uid', expectedPayload);

      expect(alertServiceSpy).toHaveBeenCalledWith({ type: 'success', message: 'Pay updated in 3 staff records' });
    });

    it('should handle server error', async () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
      });
      const { fixture, getByRole, getByText, updateWorkersSpy } = await setup();
      updateWorkersSpy.and.returnValue(throwError(errorResponse));

      const workerRow = getWorkerRow(mockWorkers[3].nameOrId);

      const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;
      userEvent.click(within(workerRow).getByLabelText('Salary'));
      userEvent.type(payRateInputBox, '25000');

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(getByText('Failed to update workers')).toBeTruthy();
    });
  });

  describe('validation', () => {
    const ErrorMessages = {
      radioButtonNotSelected: 'Select hourly or salary for the amount entered',
      hourlyRateInvalid: 'Hourly pay rate must be between £2.50 and £200.00',
      annualSalaryInvalid: 'Salary must be between £500 and £200,000',
      annualSalaryInvalidSeniorManagement: 'Salary must be between £500 and £250,000',
      hourlyRateMissing: 'Enter the hourly pay rate or select a different option',
      annualSalaryMissing: 'Enter the salary or select a different option',
      hourlyRateDecimalPlace: 'You can only have 1 or 2 digits for pence after the decimal point',
      annualSalaryDecimalPlace: 'Salary must not include pence',
    };

    it('should raise an error if user input an amount without selecting hourly or annual salary', async () => {
      const { fixture, getByRole, updateWorkersSpy, getByText } = await setup();
      const worker = mockWorkers[3];

      const workerRow = getWorkerRow(worker.nameOrId);
      userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '25000');

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(updateWorkersSpy).not.toHaveBeenCalled();

      const summaryBoxErrorMessage = `${ErrorMessages.radioButtonNotSelected} (${worker.nameOrId})`;
      expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

      expect(workerRow.textContent).toContain(ErrorMessages.radioButtonNotSelected);
    });

    const invalidHourlyRates = ['2.4', '201', '999', '0', '-100'];
    invalidHourlyRates.forEach((invalidRate) => {
      it(`should raise an error if user input an invalid hourly rate - ${invalidRate}`, async () => {
        const { fixture, getByRole, updateWorkersSpy, getByText } = await setup();
        const worker = mockWorkers[3];

        const workerRow = getWorkerRow(worker.nameOrId);

        userEvent.click(within(workerRow).getByLabelText('Hourly'));
        userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), invalidRate);

        const submitButton = getByRole('button', { name: 'Save and return' });
        userEvent.click(submitButton);

        await fixture.whenStable();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(updateWorkersSpy).not.toHaveBeenCalled();

        const summaryBoxErrorMessage = `${ErrorMessages.hourlyRateInvalid} (${worker.nameOrId})`;
        expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

        expect(workerRow.textContent).toContain(ErrorMessages.hourlyRateInvalid);
      });
    });

    const invalidAnnualSalaryValues = ['499', '200001', '0', '-100'];
    invalidAnnualSalaryValues.forEach((invalidAmount) => {
      it(`should raise an error if user input an invalid annual salary amount - ${invalidAmount}`, async () => {
        const { fixture, getByRole, updateWorkersSpy, getByText } = await setup();
        const worker = mockWorkers[3];

        const workerRow = getWorkerRow(worker.nameOrId);

        userEvent.click(within(workerRow).getByLabelText('Salary'));
        userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), invalidAmount);

        const submitButton = getByRole('button', { name: 'Save and return' });
        userEvent.click(submitButton);

        await fixture.whenStable();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(updateWorkersSpy).not.toHaveBeenCalled();

        const summaryBoxErrorMessage = `${ErrorMessages.annualSalaryInvalid} (${worker.nameOrId})`;
        expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

        expect(workerRow.textContent).toContain(ErrorMessages.annualSalaryInvalid);
      });
    });

    it(`should raise an error if user chose Hourly but the amount is missing`, async () => {
      const { fixture, getByRole, updateWorkersSpy, getByText } = await setup();
      const worker = mockWorkers[3];

      const workerRow = getWorkerRow(worker.nameOrId);

      userEvent.click(within(workerRow).getByLabelText('Hourly'));

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(updateWorkersSpy).not.toHaveBeenCalled();

      const summaryBoxErrorMessage = `${ErrorMessages.hourlyRateMissing} (${worker.nameOrId})`;
      expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

      expect(workerRow.textContent).toContain(ErrorMessages.hourlyRateMissing);
    });

    it(`should raise an error if user chose Annual salary but the amount is missing`, async () => {
      const { fixture, getByRole, updateWorkersSpy, getByText } = await setup();
      const worker = mockWorkers[3];

      const workerRow = getWorkerRow(worker.nameOrId);

      userEvent.click(within(workerRow).getByLabelText('Salary'));

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(updateWorkersSpy).not.toHaveBeenCalled();

      const summaryBoxErrorMessage = `${ErrorMessages.annualSalaryMissing} (${worker.nameOrId})`;
      expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

      expect(workerRow.textContent).toContain(ErrorMessages.annualSalaryMissing);
    });

    it(`should raise an error if the Hourly pay rate has more that 2 decimal places`, async () => {
      const { fixture, getByRole, updateWorkersSpy, getByText } = await setup();
      const worker = mockWorkers[3];

      const workerRow = getWorkerRow(worker.nameOrId);

      userEvent.click(within(workerRow).getByLabelText('Hourly'));
      userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '15.345');

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(updateWorkersSpy).not.toHaveBeenCalled();

      const summaryBoxErrorMessage = `${ErrorMessages.hourlyRateDecimalPlace} (${worker.nameOrId})`;
      expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

      expect(workerRow.textContent).toContain(ErrorMessages.hourlyRateDecimalPlace);
    });

    it(`should raise an error if user chose Annual salary but the amount has decimal place`, async () => {
      const { fixture, getByRole, updateWorkersSpy, getByText } = await setup();
      const worker = mockWorkers[3];

      const workerRow = getWorkerRow(worker.nameOrId);

      userEvent.click(within(workerRow).getByLabelText('Salary'));
      userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '30000.1');

      const submitButton = getByRole('button', { name: 'Save and return' });
      userEvent.click(submitButton);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(updateWorkersSpy).not.toHaveBeenCalled();

      const summaryBoxErrorMessage = `${ErrorMessages.annualSalaryDecimalPlace} (${worker.nameOrId})`;
      expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

      expect(workerRow.textContent).toContain(ErrorMessages.annualSalaryDecimalPlace);
    });

    describe('special rule for Senior management', () => {
      const seniorManagementWorker = workerBuilder() as WorkerWithPayData;
      seniorManagementWorker.mainJob = {
        id: 26,
        title: 'Senior management',
      };
      seniorManagementWorker.annualHourlyPay = { value: null, rate: null };

      const validAmounts = ['500', '30000', '249999', '250000'];
      const invalidAmounts = ['499', '250001', '0', '-10'];

      validAmounts.forEach((amount) => {
        it(`should accept amount between 500 and 250,000 - ${amount}`, async () => {
          const { fixture, getByRole, updateWorkersSpy, queryByText } = await setup({
            pageOneWorkers: [seniorManagementWorker],
            totalWorkerCount: 1,
          });

          const workerRow = getWorkerRow(seniorManagementWorker.nameOrId);

          userEvent.click(within(workerRow).getByLabelText('Salary'));
          userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), amount);

          const submitButton = getByRole('button', { name: 'Save and return' });
          userEvent.click(submitButton);

          await fixture.whenStable();

          expect(queryByText('There is a problem')).toBeFalsy();
          expect(updateWorkersSpy).toHaveBeenCalled();
        });
      });

      invalidAmounts.forEach((amount) => {
        it(`should not accept amount not in range 500 ~ 250,000 - ${amount}`, async () => {
          const { fixture, getByRole, updateWorkersSpy, queryByText } = await setup({
            pageOneWorkers: [seniorManagementWorker],
            totalWorkerCount: 1,
          });

          const workerRow = getWorkerRow(seniorManagementWorker.nameOrId);

          userEvent.click(within(workerRow).getByLabelText('Salary'));
          userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), amount);

          const submitButton = getByRole('button', { name: 'Save and return' });
          userEvent.click(submitButton);

          await fixture.whenStable();

          expect(queryByText('There is a problem')).toBeTruthy();
          expect(updateWorkersSpy).not.toHaveBeenCalled();

          const summaryBoxErrorMessage = `${ErrorMessages.annualSalaryInvalidSeniorManagement} (${seniorManagementWorker.nameOrId})`;
          expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

          expect(workerRow.textContent).toContain(ErrorMessages.annualSalaryInvalidSeniorManagement);
        });
      });
    });

    describe('page change', () => {
      it('should trigger validation on sorting change', async () => {
        const { fixture, getByText, getByLabelText, getWorkersWithPayDataSpy } = await setup();

        const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
        expect(sortBySelectBox).toBeTruthy();

        const worker = mockWorkers[3];

        const workerRow = getWorkerRow(worker.nameOrId);

        userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '-100');
        userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));

        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getWorkersWithPayDataSpy).not.toHaveBeenCalled();

        const summaryBoxErrorMessage = `${ErrorMessages.radioButtonNotSelected} (${worker.nameOrId})`;
        expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

        expect(workerRow.textContent).toContain(ErrorMessages.radioButtonNotSelected);

        expect(sortBySelectBox.value).toEqual('0_asc');
      });

      it('should trigger validation on page change', async () => {
        const { fixture, getByText, getByTestId, queryByTestId, getWorkersWithPayDataSpy } = await setup({
          totalWorkerCount: 32,
        });

        const worker = mockWorkers[3];
        const workerRow = getWorkerRow(worker.nameOrId);

        userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '-100');

        const pageOneLink = getByTestId('pageNoLink-1');
        userEvent.click(pageOneLink);

        await fixture.whenStable();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getWorkersWithPayDataSpy).not.toHaveBeenCalled();

        const summaryBoxErrorMessage = `${ErrorMessages.radioButtonNotSelected} (${worker.nameOrId})`;
        expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

        expect(workerRow.textContent).toContain(ErrorMessages.radioButtonNotSelected);

        expect(queryByTestId('pageNoLink-0')).toBeFalsy();
        expect(queryByTestId('pageNoLink-1')).toBeTruthy();
        expect(queryByTestId('pageNoLink-2')).toBeTruthy();

        expect(queryByTestId('pageNoText-0')).toBeTruthy();
      });

      it('should trigger validation on job role search', async () => {
        const { fixture, getByText, getByLabelText, queryByText, getWorkersWithPayDataSpy } = await setup({
          totalWorkerCount: 32,
        });

        const worker = mockWorkers[3];
        const workerRow = getWorkerRow(worker.nameOrId);

        userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '-100');

        const searchBox = getByLabelText(/Search by job role/) as HTMLInputElement;
        userEvent.type(searchBox, 'Care');
        const searchBoxWrapper = searchBox.parentElement!;
        userEvent.click(within(searchBoxWrapper).getByText('Care worker'));

        await fixture.whenStable();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getWorkersWithPayDataSpy).not.toHaveBeenCalled();

        const summaryBoxErrorMessage = `${ErrorMessages.radioButtonNotSelected} (${worker.nameOrId})`;
        expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

        expect(workerRow.textContent).toContain(ErrorMessages.radioButtonNotSelected);

        expect(searchBox.value).toEqual('Care worker');
        expect(queryByText('Clear search results')).toBeFalsy();
      });

      it('should trigger validation when job role search is cleared', async () => {
        const mockCareWorker = workerBuilder({
          overrides: {
            mainJob: {
              id: 10,
              title: 'Care worker',
            },
            annualHourlyPay: {
              value: null,
            },
          },
        }) as WorkerWithPayData;
        const { fixture, getByText, getByLabelText, getWorkersWithPayDataSpy } = await setup({
          totalWorkerCount: 32,
        });

        getWorkersWithPayDataSpy.and.returnValue(of({ count: 4, workers: [...mockWorkers, mockCareWorker] }));

        const searchBox = getByLabelText(/Search by job role/) as HTMLInputElement;
        userEvent.type(searchBox, 'Care');
        const searchBoxWrapper = searchBox.parentElement!;
        userEvent.click(within(searchBoxWrapper).getByText('Care worker'));

        const worker = mockCareWorker;
        const workerRow = getWorkerRow(mockCareWorker.nameOrId);
        userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '-100');
        userEvent.click(getByText('Clear search results'));

        getWorkersWithPayDataSpy.calls.reset();
        await fixture.whenStable();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getWorkersWithPayDataSpy).not.toHaveBeenCalled();

        const summaryBoxErrorMessage = `${ErrorMessages.radioButtonNotSelected} (${worker.nameOrId})`;
        expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

        expect(workerRow.textContent).toContain(ErrorMessages.radioButtonNotSelected);

        expect(searchBox.value).toEqual('Care worker');
        expect(getByText('Clear search results')).toBeTruthy();
      });
    });

    it('should keep error message unchanged when user amend form input', async () => {
      const { fixture, getByText, getByLabelText, getWorkersWithPayDataSpy } = await setup();

      const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;

      const worker = mockWorkers[3];
      const workerRow = getWorkerRow(worker.nameOrId);
      const inputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/);

      userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '-100');
      userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));

      fixture.detectChanges();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(getWorkersWithPayDataSpy).not.toHaveBeenCalled();

      userEvent.clear(inputBox);
      userEvent.type(inputBox, '30000');
      userEvent.click(within(workerRow).getByLabelText('Salary'));

      expect(getByText('There is a problem')).toBeTruthy();
      const summaryBoxErrorMessage = `${ErrorMessages.radioButtonNotSelected} (${worker.nameOrId})`;
      expect(getErrorSummaryBox().textContent).toContain(summaryBoxErrorMessage);

      expect(workerRow.textContent).toContain(ErrorMessages.radioButtonNotSelected);
    });
  });
});
