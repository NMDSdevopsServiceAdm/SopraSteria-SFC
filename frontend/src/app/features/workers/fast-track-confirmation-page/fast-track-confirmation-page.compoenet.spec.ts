import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { FastTrackConfirmationPageComponent } from './fast-track-confirmation-page.component';
import { render } from '@testing-library/angular';
import { EstablishmentService } from '@core/services/establishment.service';
import { AlertService } from '@core/services/alert.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';

describe('FastTrackConfirmationPageComponent', () => {
  async function setup(overrides: any = {}) {
    const establishment = establishmentBuilder() as Establishment;
    const mockGroups = overrides.groups ?? [
      {
        jobId: 1,
        title: 'Care worker',
        count: 2,
        workers: [{ uid: '1' }, { uid: '2' }],
        annualHourlyPay: { value: 'Hourly', rate: 10 },
      },
      {
        jobId: 2,
        title: 'Senior care worker',
        count: 3,
        workers: [{ uid: '3' }],
        annualHourlyPay: { value: null, rate: null },
      },
    ];

    const workersByJobRole = { groups: mockGroups };

    const workerServiceMock = {
      getWorkersGroupedByJobRole: jasmine.createSpy().and.returnValue(workersByJobRole),
    };

    const setupTools = await render(FastTrackConfirmationPageComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        WindowRef,
        AlertService,
        BackLinkService,

        {
          provide: WorkerService,
          useValue: workerServiceMock,
        },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: establishment,
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const establishmentService = injector.inject(EstablishmentService);
    const updateWorkersSpy = spyOn(establishmentService, 'updateWorkers').and.returnValue(of(null));

    return {
      ...setupTools,
      component,

      updateWorkersSpy,
      routerSpy,
      alertServiceSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should filter groups with rate only', async () => {
    const { component } = await setup();

    expect(component.filteredGroups.length).toBe(1);
    expect(component.filteredGroups[0].title).toBe('Care worker');
  });

  it('should calculate totalCount from filtered groups', async () => {
    const { component } = await setup();

    expect(component.totalCount).toBe(2);
  });

  it('should render total count in heading', async () => {
    const { getByText } = await setup();

    expect(getByText("You're about to update pay in 2 staff records")).toBeTruthy();
  });

  it('should call updateWorkers with correct payload', async () => {
    const { component, updateWorkersSpy } = await setup();

    component.onSubmit();

    expect(updateWorkersSpy).toHaveBeenCalled();

    const payload = updateWorkersSpy.calls.mostRecent().args[1];

    expect(payload.length).toBe(2);
    expect(payload[0]).toEqual({
      uid: '1',
      annualHourlyPay: { value: 'Hourly', rate: 10 },
    });
  });

  describe('on submit', () => {
    it('should navigate to update-pay-multiple-staff page and show banner after successful submit', async () => {
      const { fixture, routerSpy, alertServiceSpy, component } = await setup();

      component.onSubmit();

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.workplace.uid, 'update-pay-multiple-staff']);

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Pay updated in 2 staff records',
      });
    });
  });

  describe('onCancel()', () => {
    it('should navigate to staff-record/fast-track-pay-updates after clicking Cancel', async () => {
      const { getByText, component } = await setup();

      const cancelLink = getByText('Cancel');

      expect(cancelLink).toBeTruthy();
      expect(cancelLink.getAttribute('href')).toEqual(
        `/workplace/${component.workplace.uid}/staff-record/fast-track-pay-updates`,
      );
    });
  });
});
