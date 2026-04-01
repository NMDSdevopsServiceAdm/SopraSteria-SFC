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
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { getByLabelText, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { UpdatePayForMultipleStaffComponent } from './update-pay-for-multiple-staff.component';

fdescribe('UpdatePayForMultipleStaffComponent', () => {
  const workerBuilder = build('Worker', {
    fields: {
      uid: fake((f) => f.datatype.uuid()),
      nameOrId: fake((f) => f.name.findName()),
      mainJob: {
        id: sequence(),
        title: fake((f) => f.name.jobTitle()),
      },
      annualHourlyPay: null,
    },
  });

  const mockWorkers = [
    workerBuilder({ overrides: { annualHourlyPay: { value: 'Annually', rate: 25000 } } }),
    workerBuilder({ overrides: { annualHourlyPay: { value: 'Hourly', rate: 12.5 } } }),
    workerBuilder({ overrides: { annualHourlyPay: { value: "Don't know" } } }),
    workerBuilder({ overrides: { annualHourlyPay: { value: null } } }),
  ] as WorkerWithPayData[];

  const buildMultipleWorkers = (num: number) => {
    return Array(num)
      .fill(null)
      .map(() => workerBuilder());
  };

  const payValues = ['Hourly', 'Annually', "Don't know"];
  const radioButtonLabels = ['Hourly', 'Salary', 'Not known'];
  const payValueToLabel = (payValue: string): string => radioButtonLabels[payValues.indexOf(payValue)];

  const expectWorkerRowToHaveData = (
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
    const firstPageWorker = overrides?.firstPageWorker ?? mockWorkers;
    const totalWorkerCount = overrides?.totalWorkerCount ?? firstPageWorker.length;
    const mockWorkersWithPayData = { count: totalWorkerCount, workers: firstPageWorker };

    const setuptools = await render(UpdatePayForMultipleStaffComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        WindowRef,
        AlertService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
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
    const workerService = injector.inject(WorkerService);

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
      workerService,
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

  it('should show a link to fast-track-pay-updates page', async () => {
    const { route, getByText, routerSpy } = await setup();
    const expectedLinkText = 'Fast-track pay updates by job roles';

    const link = getByText(expectedLinkText);
    expect(link).toBeTruthy();

    userEvent.click(link);
    expect(routerSpy).toHaveBeenCalledWith(['../fast-track-pay-updates'], { relativeTo: route });
  });

  it('should show a table with the nameOrId, jobRole and pay for the first 15 workers', async () => {
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

  describe('prefill', () => {
    it('should prefill the pay answer for existing workers', async () => {
      const { getByRole } = await setup();

      const workersTable = getByRole('table');

      expect(workersTable).toBeTruthy();

      mockWorkers.forEach((worker) => {
        expectWorkerRowToHaveData(
          workersTable,
          worker.nameOrId,
          worker.annualHourlyPay.value,
          worker.annualHourlyPay.rate,
        );
      });
    });
  });

  describe('sorting and pagination', () => {
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
      const { queryByLabelText } = await setup({ firstPageWorker: [workerBuilder()] });
      const sortBySelectBox = queryByLabelText('Sort by') as HTMLSelectElement;
      expect(sortBySelectBox).toBeFalsy();
    });

    it('should show a search bar and pagination footer when there are more than 15 workers', async () => {
      const { queryByLabelText, queryByTestId } = await setup({
        totalWorkerCount: 31,
      });

      const searchInput = queryByLabelText(/Search by job role/);
      expect(searchInput).toBeTruthy();

      const footer = queryByTestId('pagination-footer');
      expect(footer).toBeTruthy();

      expect(within(footer).getByTestId('pageNoText-0')).toBeTruthy();
      expect(within(footer).getByTestId('pageNoLink-1')).toBeTruthy();
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
  });
});
