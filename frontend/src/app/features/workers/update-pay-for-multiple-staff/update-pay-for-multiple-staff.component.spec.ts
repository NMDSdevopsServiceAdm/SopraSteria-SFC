import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
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
import { build, fake, oneOf, sequence } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
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

  const expectWorkerTableToHaveData = (
    table: HTMLElement,
    workerNameOrId: string,
    payOption: string,
    payRate: number,
  ) => {
    const row = within(table).getByText(workerNameOrId).closest('tr');
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
    const expectedInputBoxValue = payRate ? payRate.toString() : '';
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
        const row = within(workersTable).getByText(worker.nameOrId).closest('tr');
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
        expectWorkerTableToHaveData(
          workersTable,
          worker.nameOrId,
          worker.annualHourlyPay.value,
          worker.annualHourlyPay.rate,
        );
      });
    });

    it('should clear the pay rate when "Not known" is selected', async () => {
      const { fixture, getByRole } = await setup();

      const workersTable = getByRole('table');
      const workerRow = within(workersTable).getByText(mockWorkers[3].nameOrId).closest('tr')!;

      const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;
      userEvent.type(payRateInputBox, '25000');

      expect(payRateInputBox.value).toEqual('25000');

      userEvent.click(within(workerRow).getByLabelText('Not known'));
      fixture.detectChanges();

      expect(payRateInputBox.value).toEqual('');
    });

    it('should clear the "Not known" radio button when user type in pay rate', async () => {
      const { fixture, getByRole } = await setup();

      const workersTable = getByRole('table');
      const workerRow = within(workersTable).getByText(mockWorkers[3].nameOrId).closest('tr');

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
        const { fixture, getByRole } = await setup();

        const workersTable = getByRole('table');
        const workerRow = within(workersTable).getByText(mockWorkers[3].nameOrId).closest('tr');

        const payRateInputBox = within(workerRow).getByLabelText(/Hourly pay rate or salary/) as HTMLInputElement;
        userEvent.type(payRateInputBox, '25000');

        expect(payRateInputBox.value).toEqual('25000');

        userEvent.click(within(workerRow).getByLabelText(radioButtonLabel));
        fixture.detectChanges();

        expect(payRateInputBox.value).toEqual('25000');
      });

      it(`should not clear the ${radioButtonLabel} radio button when user type in pay rate`, async () => {
        const { fixture, getByRole } = await setup();

        const workersTable = getByRole('table');
        const workerRow = within(workersTable).getByText(mockWorkers[3].nameOrId).closest('tr');

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
        const pageIndex = params.pageIndex;
        return of({ count: 32, workers: pages[pageIndex] });
      });

      const workersTable = getByRole('table');

      userEvent.click(queryByTestId('pageNoLink-1'));
      await fixture.whenStable();

      expect(getWorkersWithPayDataSpy).toHaveBeenCalledWith('mocked-uid', {
        pageIndex: 1,
        itemsPerPage: 15,
        sortBy: 'staffNameAsc',
      });

      mockPageTwoWorkers.forEach((worker) => {
        expectWorkerTableToHaveData(
          workersTable,
          worker.nameOrId,
          worker.annualHourlyPay.value,
          worker.annualHourlyPay.rate,
        );
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
        const { fixture, getByText, getByLabelText, getWorkersWithPayDataSpy, queryByTestId } = await setup({
          totalWorkerCount: 16,
        });

        getWorkersWithPayDataSpy.and.callFake((_uid) => {
          return of({ count: 3, workers: mockWorkers.slice(3) });
        });

        // go to page 2 and sort by staff name desc
        userEvent.click(queryByTestId('pageNoLink-1')!);

        const sortBySelectBox = getByLabelText('Sort by') as HTMLSelectElement;
        userEvent.selectOptions(sortBySelectBox, getByText('Staff name (Z to A)'));

        const searchBox = getByLabelText(/Search by job role/)!;
        userEvent.type(searchBox, 'Care');
        const searchBoxWrapper = searchBox.parentElement!;

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
      expect(getByText('Make sure that your spelling is correct.')).toBeTruthy();
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

      const workersTable = getByRole('table');
      const workerRow = within(workersTable).getByText(mockWorkers[3].nameOrId).closest('tr')!;

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

      const workersTable = getByRole('table');

      const workerRow = within(workersTable).getByText(mockWorkers[3].nameOrId).closest('tr')!;
      userEvent.click(within(workerRow).getByLabelText('Salary'));
      userEvent.type(within(workerRow).getByLabelText(/Hourly pay rate or salary/), '25000');

      const workerRow2 = within(workersTable).getByText(mockWorkers[13].nameOrId).closest('tr')!;
      userEvent.click(within(workerRow2).getByLabelText('Not known'));

      // click page 2
      userEvent.click(getByTestId('pageNoLink-1')!);
      await fixture.whenStable();

      const workerRow3 = within(workersTable).getByText(mockWorkers[23].nameOrId).closest('tr')!;
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
  });
});
