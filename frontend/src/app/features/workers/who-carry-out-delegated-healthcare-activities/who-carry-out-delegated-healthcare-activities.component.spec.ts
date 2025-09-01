import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MockRouter } from '@core/test-utils/MockRouter';

import { of } from 'rxjs';

import { WhoCarryOutDelegatedHealthcareActivitiesComponent } from './who-carry-out-delegated-healthcare-activities.component';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import {
  MockDelegatedHealthcareActivitiesService,
  mockDHADefinition,
} from '@core/test-utils/MockDelegatedHealthcareActivitiesService';
import { AlertService } from '@core/services/alert.service';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { WindowRef } from '@core/services/window.ref';

describe('WhoCarryOutDelegatedHealthcareActivitiesComponent', () => {
  const mockWorkers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

  const setup = async (overrides: any = {}) => {
    const workersToShow = overrides.workersToShow ?? mockWorkers;
    const workerCount = overrides.workerCount ?? workersToShow.length;
    const getDHAWorkersResponse = { workers: workersToShow, workerCount: workerCount };
    const getDHAWorkersSpy = jasmine.createSpy().and.returnValue(of(getDHAWorkersResponse));

    const routerSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    const setuptools = await render(WhoCarryOutDelegatedHealthcareActivitiesComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        WindowRef,
        AlertService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: DelegatedHealthcareActivitiesService,
          useFactory: MockDelegatedHealthcareActivitiesService.factory({
            getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer: getDHAWorkersSpy,
          }),
        },
        {
          provide: Router,
          useFactory: MockRouter.factory({ navigate: routerSpy }),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workerWhoRequireDHAAnswer: getDHAWorkersResponse,
              },
            },
          },
        },
      ],
    });

    const fixture = setuptools.fixture;
    const component = fixture.componentInstance;
    fixture.autoDetectChanges();

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    const updateWorkersSpy = spyOn(establishmentService, 'updateWorkers').and.returnValue(of({}));
    const workerService = injector.inject(WorkerService);

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const router = injector.inject(Router) as Router;

    return {
      ...setuptools,
      component,
      fixture,
      establishmentService,
      workerService,
      getDHAWorkersSpy,
      alertServiceSpy,
      router,
      routerSpy,
      updateWorkersSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a h1 heading', async () => {
    const { getByRole } = await setup();

    const h1Heading = getByRole('heading', { level: 1 });
    expect(h1Heading).toBeTruthy();
    expect(h1Heading.textContent).toEqual('Who carries out delegated healthcare activities?');
  });

  it('should show the DHA definition', async () => {
    const { getByText } = await setup();

    expect(getByText(mockDHADefinition)).toBeTruthy();
  });

  it('should show a reveal for examples of DHA', async () => {
    const { getByText } = await setup();

    const reveal = getByText('See delegated healthcare activities that your staff might carry out');

    expect(reveal).toBeTruthy();
  });

  describe('workers table', () => {
    it('should display a row for each worker with nameOrId whose DHA activity is not answered', async () => {
      const { getByTestId } = await setup();

      mockWorkers.forEach((worker, index) => {
        const workerRow = getByTestId(`worker-row-${index}`);
        const workerNameLink = within(workerRow).getByText(worker.nameOrId, { selector: 'a' }) as HTMLLinkElement;
        expect(workerNameLink).toBeTruthy();
      });
    });

    it('should display a row for each worker with Job role whose DHA activity is not answered', async () => {
      const { getByTestId } = await setup();

      mockWorkers.forEach((worker, index) => {
        const workerRow = getByTestId(`worker-row-${index}`);
        const workerJob = within(workerRow).getByText(worker.mainJob.title);
        expect(workerJob).toBeTruthy();
      });
    });
  });

  describe('on submit', () => {
    it('should navigate to home page and show banner after successful submit', async () => {
      const { fixture, getByText, routerSpy, alertServiceSpy } = await setup();

      const dhaRadio = fixture.nativeElement.querySelector('input[id="delegatedHealthcare-0-0"]');

      const saveButton = getByText('Save and return');

      fireEvent.click(dhaRadio);
      fireEvent.click(saveButton);

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Delegated healthcare activity information saved',
      });
    });
  });

  describe('onCancel()', () => {
    it('should navigate to dashboard after clicking Cancel', async () => {
      const { getByText, routerSpy } = await setup();

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
    });
  });

  describe('pagination', () => {
    it('should show pagination links when number of non-answered workers is larger then number of workers per page', async () => {
      const { getByTestId } = await setup({ workerCount: 20 });

      const pagination = getByTestId('pagination');
      expect(within(pagination).getByRole('link', { name: '2' })).toBeTruthy();
      expect(within(pagination).getByRole('link', { name: 'Next' })).toBeTruthy();
    });

    it('should not show pagination links when number of non-answered workers is less then or equal number of workers per page', async () => {
      const { fixture, queryByTestId } = await setup({ workerCount: 15 });
      fixture.detectChanges();

      expect(queryByTestId('pagination')).toBeFalsy();
    });

    it('should retrieve and display the workers for next page when "Next" link is clicked', async () => {
      const { fixture, getByRole, getByTestId, getDHAWorkersSpy } = await setup({ workerCount: 20 });

      const mockNextPageWorkers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      getDHAWorkersSpy.and.returnValue(of({ workers: mockNextPageWorkers, workerCount: 20 }));

      userEvent.click(getByRole('link', { name: 'Next' }));
      await fixture.whenStable();

      expect(getDHAWorkersSpy).toHaveBeenCalledWith('mocked-uid', { pageIndex: 1, itemsPerPage: 15 });

      mockNextPageWorkers.forEach((worker, index) => {
        const workerRow = getByTestId(`worker-row-${index}`);
        const workerNameLink = within(workerRow).getByText(worker.nameOrId, { selector: 'a' }) as HTMLLinkElement;
        expect(workerNameLink).toBeTruthy();
      });

      const pagination = getByTestId('pagination');
      expect(within(pagination).getByRole('link', { name: '1' })).toBeTruthy();
      expect(within(pagination).getByRole('link', { name: 'Previous' })).toBeTruthy();
    });
  });
});
