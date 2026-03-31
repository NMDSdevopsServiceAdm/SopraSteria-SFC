import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkersWithPayDataResponse, WorkerWithPayData } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { within } from '@testing-library/dom';
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
  ] as WorkerWithPayData[];
  const radioButtonLabels = ['Hourly', 'Salary', 'Not known'];

  const setup = async (overrides: any = {}) => {
    const firstPageWorker = overrides?.firstPageWorker ?? mockWorkers;
    const totalWorkersCount = overrides?.totalWorkersCount ?? firstPageWorker.length;
    const mockWorkersWithPayData = { count: totalWorkersCount, workers: firstPageWorker };

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

  it('should show a table with the nameOrId, jobRole and pay data for the first 15 workers', async () => {
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
});
