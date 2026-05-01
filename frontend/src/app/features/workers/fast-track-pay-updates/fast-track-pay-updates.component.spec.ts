import { getTestBed } from '@angular/core/testing';
import { FastTrackPayUpdatesComponent } from './fast-track-pay-updates.component';
import { fireEvent, render } from '@testing-library/angular';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import userEvent from '@testing-library/user-event';
import { Establishment } from '@core/model/establishment.model';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';

describe('FastTrackPayUpdatesComponent', () => {
  const workersWithSingleJobRole = {
    groups: [
      {
        jobId: 10,
        title: 'Care worker',
        workers: [
          {
            uid: '559b1bfb-3b1f-47a9-ace3-956e60fc2221',
            mainJob: {
              id: 10,
              title: 'Care worker',
            },
          },
        ],
        count: 1,
      },
    ],
  };

  const workersWithMultipleJobRoles = {
    groups: [
      {
        jobId: 10,
        title: 'Care worker',
        workers: [
          {
            uid: '559b1bfb-3b1f-47a9-ace3-956e60fc2221',
            mainJob: {
              id: 10,
              title: 'Care worker',
            },
          },
        ],
        count: 5,
      },
      {
        jobId: 11,
        title: 'Senior care worker',
        workers: [
          {
            uid: '559b1bfb-3b1f-47a9-ace3-956e60fc2221',
            mainJob: {
              id: 11,
              title: 'Senior care worker',
            },
          },
        ],
        count: 2,
      },
      {
        jobId: 12,
        title: 'Manager',
        workers: [
          {
            uid: '559b1bfb-3b1f-47a9-ace3-956e60fc2221',
            mainJob: {
              id: 12,
              title: 'Manager',
            },
          },
        ],
        count: 1,
      },
    ],
  };

  async function setup(overrides: any = {}) {
    const establishment = establishmentBuilder() as Establishment;
    const setupTools = await render(FastTrackPayUpdatesComponent, {
      imports: [SharedModule, ReactiveFormsModule],
      providers: [
        BackService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workersByJobRole: overrides.workersWithMultipleJobRoles ?? workersWithSingleJobRole,
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

    const backLinkService = injector.inject(BackLinkService) as BackLinkService;
    const showBackLinkSpy = spyOn(backLinkService, 'showBackLink');

    const workerService = injector.inject(WorkerService) as WorkerService;
    const setWorkersGroupedByJobRoleSpy = spyOn(workerService, 'setWorkersGroupedByJobRole');

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);
    return {
      ...setupTools,
      component,
      showBackLinkSpy,
      setWorkersGroupedByJobRoleSpy,
      workerService,
      routerSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('displays a Back link', async () => {
    const { component, showBackLinkSpy } = await setup();
    component.ngOnInit();
    expect(showBackLinkSpy).toHaveBeenCalled();
  });

  describe('Headings', () => {
    it('should display the Staff records caption', async () => {
      const { getByTestId } = await setup();
      const caption = getByTestId('caption');
      expect(caption.textContent.trim()).toEqual('Staff records');
    });

    it('should display the main heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('heading');
      expect(heading.textContent.trim()).toEqual('Fast-track pay updates by job roles');
    });
  });

  it('should use resolver data and set service when service has no data', async () => {
    const { component, setWorkersGroupedByJobRoleSpy, workerService } = await setup();

    spyOn(workerService, 'getWorkersGroupedByJobRole').and.returnValue(null);

    component.ngOnInit();

    expect(setWorkersGroupedByJobRoleSpy).toHaveBeenCalledWith({
      groups: workersWithSingleJobRole.groups,
    });

    expect(component.workersByJobRole).toEqual(workersWithSingleJobRole);
  });

  it('should use service data when it exists and not call setWorkersGroupedByJobRole', async () => {
    const { component, setWorkersGroupedByJobRoleSpy, workerService } = await setup();

    const mockServiceData = {
      groups: [
        {
          jobId: 99,
          title: 'Test role',
          workers: [],
          count: 1,
        },
      ],
    };

    spyOn(workerService, 'getWorkersGroupedByJobRole').and.returnValue(mockServiceData);

    component.ngOnInit();

    expect(setWorkersGroupedByJobRoleSpy).not.toHaveBeenCalled();
    expect(component.workersByJobRole).toEqual(mockServiceData);
  });

  describe('Table', () => {
    it('should include the Job role column heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('job-role-header');
      expect(heading.textContent.trim()).toEqual('Job role');
    });

    it('should include the New hourly pay rate or salary column heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('pay-header');
      expect(heading.textContent.trim()).toEqual('New hourly pay rate or salary');
    });

    describe('Job role column contents', () => {
      it('should contain the details of the workers where there is one job role', async () => {
        const { getByText } = await setup();
        const content = getByText('Care worker (1 record)');
        expect(content).toBeTruthy();
      });

      it('should contain the details of the workers where there are multiple job roles', async () => {
        const { getByText } = await setup({ workersWithMultipleJobRoles });
        const contentManager = getByText('Manager (1 record)');
        const contentSeniorCareWorker = getByText('Senior care worker (2 records)');
        const contentCareWorker = getByText('Care worker (5 records)');

        expect(contentManager).toBeTruthy();
        expect(contentSeniorCareWorker).toBeTruthy();
        expect(contentCareWorker).toBeTruthy();
      });
    });
  });
  describe('Continue button', () => {
    it('should be displayed', async () => {
      const { getByRole } = await setup();
      const button = getByRole('button', { name: 'Continue' });
      expect(button).toBeTruthy();
    });

    describe('When there is 1 job role', () => {
      it('should call the worker service with the updated pay information', async () => {
        const { fixture, getByRole, setWorkersGroupedByJobRoleSpy, getByTestId } = await setup();

        const amountInputBox = getByTestId('amount-input-box-0');
        const radio = getByTestId('hourly-radio-0');

        await userEvent.type(amountInputBox, '12');
        await userEvent.click(radio);

        await fixture.whenStable();

        const button = getByRole('button', { name: 'Continue' });
        await userEvent.click(button);

        expect(setWorkersGroupedByJobRoleSpy).toHaveBeenCalled();
      });
    });

    describe('When there are multiple job roles', () => {
      it('should call the worker service with multiple job roles', async () => {
        const { fixture, getByRole, setWorkersGroupedByJobRoleSpy, getByTestId } = await setup({
          workersWithMultipleJobRoles,
        });

        await userEvent.click(getByTestId('hourly-radio-0'));
        await userEvent.type(getByTestId('amount-input-box-0'), '12');

        await userEvent.click(getByTestId('salary-radio-1'));
        await userEvent.type(getByTestId('amount-input-box-1'), '2500');

        await userEvent.click(getByTestId('hourly-radio-2'));
        await userEvent.type(getByTestId('amount-input-box-2'), '16');

        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentInstance.form.updateValueAndValidity();

        const button = getByRole('button', { name: 'Continue' });
        await userEvent.click(button);

        expect(setWorkersGroupedByJobRoleSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Validation', () => {
    it('should show error if amount is entered without selecting hourly or salary', async () => {
      const { fixture, getByRole, getByTestId, getByText } = await setup();

      const input = getByTestId('amount-input-box-0');
      await userEvent.type(input, '100');

      const button = getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
    });

    it('should show error when hourly is selected but amount is missing', async () => {
      const { fixture, getByRole, getByTestId, getByText } = await setup();

      const radio = getByTestId('hourly-radio-0');
      await userEvent.click(radio);

      const button = getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
    });

    it('should show error for invalid hourly rate (out of range)', async () => {
      const { fixture, getByRole, getByTestId, getByText } = await setup();

      const input = getByTestId('amount-input-box-0');
      const radio = getByTestId('hourly-radio-0');

      await userEvent.click(radio);
      await userEvent.type(input, '1');

      const button = getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
    });

    it('should show error when salary has decimal places', async () => {
      const { fixture, getByRole, getByTestId, getByText } = await setup();

      const input = getByTestId('amount-input-box-0');
      const radio = getByTestId('salary-radio-0');

      await userEvent.click(radio);
      await userEvent.type(input, '25000.50');

      const button = getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      await fixture.whenStable();

      expect(getByText('There is a problem')).toBeTruthy();
    });
  });
  describe('Cancel link', () => {
    it('should show  a cancel link', async () => {
      const { getByText } = await setup();

      const cancelLink = getByText('Cancel');
      expect(cancelLink).toBeTruthy();
    });

    it('should return to update-pay-for-multiple-staff page on cancel', async () => {
      const { getByText, routerSpy, component } = await setup();

      const cancelLink = getByText('Cancel');
      userEvent.click(cancelLink);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        'update-pay-for-multiple-staff',
      ]);
    });
  });
});
