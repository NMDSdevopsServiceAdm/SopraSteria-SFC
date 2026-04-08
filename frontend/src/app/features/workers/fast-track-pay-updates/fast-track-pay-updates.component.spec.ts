import { getTestBed } from '@angular/core/testing';
import { FastTrackPayUpdatesComponent } from './fast-track-pay-updates.component';
import { fireEvent, render } from '@testing-library/angular';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import userEvent from '@testing-library/user-event';

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
    const setupTools = await render(FastTrackPayUpdatesComponent, {
      imports: [ReactiveFormsModule],
      providers: [
        BackService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workersByJobRole: overrides.workersWithMultipleJobRoles ?? workersWithSingleJobRole,
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

    return {
      ...setupTools,
      component,
      showBackLinkSpy,
      setWorkersGroupedByJobRoleSpy,
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

  describe('Table', () => {
    it('should include the Job role column heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('job-role-heading');
      expect(heading.textContent.trim()).toEqual('Job role');
    });

    it('should include the New hourly pay rate or salary column heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('pay-heading');
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
        userEvent.type(amountInputBox, '12');

        const radio = getByTestId('hourly-radio-0');
        fireEvent.click(radio);

        fixture.detectChanges();

        const button = getByRole('button', { name: 'Continue' });
        button.click();

        const workers = {
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
              annualHourlyPay: {
                value: 'Hourly',
                rate: 12,
              },
            },
          ],
        };

        expect(setWorkersGroupedByJobRoleSpy).toHaveBeenCalledWith(workers);
      });
    });

    describe('When there are multiple job roles', () => {
      it('should call the worker service with the updated pay information', async () => {
        const { fixture, getByRole, setWorkersGroupedByJobRoleSpy, getByTestId } = await setup({
          workersWithMultipleJobRoles,
        });

        const firstAmountInputBox = getByTestId('amount-input-box-0');
        userEvent.type(firstAmountInputBox, '12');

        const secondAmountInputBox = getByTestId('amount-input-box-1');
        userEvent.type(secondAmountInputBox, '14');

        const thirdAmountInputBox = getByTestId('amount-input-box-2');
        userEvent.type(thirdAmountInputBox, '16');

        const firstRadioHourly = getByTestId('hourly-radio-0');
        fireEvent.click(firstRadioHourly);

        const secondRadioSalary = getByTestId('salary-radio-1');
        fireEvent.click(secondRadioSalary);

        const thirdRadioHourly = getByTestId('hourly-radio-2');
        fireEvent.click(thirdRadioHourly);

        fixture.detectChanges();

        const button = getByRole('button', { name: 'Continue' });
        button.click();

        const workers = {
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
              annualHourlyPay: {
                value: 'Hourly',
                rate: 12,
              },
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
              annualHourlyPay: {
                value: 'Annually',
                rate: 14,
              },
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
              annualHourlyPay: {
                value: 'Hourly',
                rate: 16,
              },
            },
          ],
        };

        expect(setWorkersGroupedByJobRoleSpy).toHaveBeenCalledWith(workers);
      });
    });
  });

  describe('Cancel link', () => {
    it('should be displayed correctly', async () => {
      const { getByRole } = await setup();
      const link = getByRole('link', { name: 'Cancel' });
      expect(link).toBeTruthy();
    });

    // to be updated when previous page is developed
    it('should have the correct href', async () => {
      const { getByRole } = await setup();
      const link = getByRole('link', { name: 'Cancel' });
      expect(link.getAttribute('href')).toEqual('/');
    });
  });
});
