import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CarryOutDelegatedHealthcareActivitiesComponent } from './carry-out-delegated-healthcare-activities.component';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkersModule } from '../workers.module';
import { UntypedFormBuilder } from '@angular/forms';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { HttpClient } from '@angular/common/http';
import userEvent from '@testing-library/user-event';
import lodash from 'lodash';
import { getTestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Contracts } from '@core/model/contracts.enum';

fdescribe('CarryOutDelegatedHealthcareActivitiesComponent', () => {
  const setup = async (overrides: any = {}) => {
    const workerServiceOverrides = lodash.pick(overrides, 'worker', 'returnTo');

    const setupTools = await render(CarryOutDelegatedHealthcareActivitiesComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, WorkersModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: overrides.insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                data: {
                  establishment: { uid: 'mocked-uid' },
                  primaryWorkplace: {},
                },
              },
            },
            snapshot: {
              params: {},
            },
          },
        },
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithOverrides.factory(workerServiceOverrides),
          deps: [HttpClient],
        },
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const workerUid = component.worker.uid;
    const workplaceUid = component.workplace.uid;

    const injector = getTestBed();
    const workerService = injector.inject(WorkerService) as WorkerService;
    const workerServiceSpy = spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: workerUid }));
    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);

    return { ...setupTools, workerService, workerServiceSpy, routerSpy, component, workplaceUid, workerUid };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a heading and caption', async () => {
    const { getByRole, getByTestId } = await setup();

    expect(getByRole('heading', { level: 1 }).textContent).toContain(
      'Do they carry out delegated healthcare activities?',
    );

    const sectionHeading = getByTestId('section-heading');

    expect(sectionHeading).toBeTruthy();
    expect(sectionHeading.textContent).toEqual('Employment details');
  });

  describe('Form', () => {
    const labels = ['Yes', 'No', 'I do not know'];
    const values = ['Yes', 'No', "Don't know"];

    it('should show radio buttons for each answer', async () => {
      const { getByRole } = await setup();

      labels.forEach((label) => {
        expect(getByRole('radio', { name: label })).toBeTruthy();
      });
    });

    it('should prefill when there is a previously saved answer', async () => {
      const { getByLabelText } = await setup({
        worker: {
          carryOutDelegatedHealthcareActivities: 'Yes',
        },
      });

      const radioButton = getByLabelText('Yes') as HTMLInputElement;

      expect(radioButton.checked).toBeTruthy();
    });

    lodash.zip(labels, values).forEach(([label, value]) => {
      it(`should call updateWorker() with expected payload on submit (${value})`, async () => {
        const { getByLabelText, getByText, workerServiceSpy, workerUid, workplaceUid } = await setup({
          insideFlow: true,
        });

        userEvent.click(getByLabelText(label));

        userEvent.click(getByText('Save and continue'));

        const expectedPayload = {
          carryOutDelegatedHealthcareActivities: value,
        };

        expect(workerServiceSpy).toHaveBeenCalledWith(workplaceUid, workerUid, expectedPayload);
      });
    });

    it('should not call updateWorker() when no answer was chosen', async () => {
      const { getByText, workerServiceSpy } = await setup({
        insideFlow: true,
      });

      userEvent.click(getByText('Save and continue'));

      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('should not call updateWorker() when skipped the question', async () => {
      const { getByText, workerServiceSpy } = await setup({
        insideFlow: true,
      });

      userEvent.click(getByText('Skip this question'));

      expect(workerServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('When in add new worker flow', () => {
    it('should show a progress bar', async () => {
      const { getByTestId } = await setup({ insideFlow: true });

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should show a "Save and continue" cta button,  "Skip this question" link and "View this staff record" link', async () => {
      const { getByText } = await setup({ insideFlow: true });

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    describe('navigate to next question', () => {
      const contractTypesPermanentOrTemporary = [Contracts.Permanent, Contracts.Temporary];
      const otherContractTypes = [Contracts.Other, Contracts.Agency, Contracts.Pool_Bank];

      describe('when contractType is Permanent or Temporary', () => {
        contractTypesPermanentOrTemporary.forEach((contractType) => {
          ['Save and continue', 'Skip this question'].forEach((buttonClicked) => {
            it(`should navigate to 'days-of-sickness' question on ${buttonClicked} - ${contractType}`, async () => {
              const { getByText, routerSpy } = await setup({
                insideFlow: true,
                worker: { uid: 'worker-uid', contract: contractType },
              });

              const button = getByText('Save and continue');
              userEvent.click(button);

              expect(routerSpy).toHaveBeenCalledWith([
                '/workplace',
                'mocked-uid',
                'staff-record',
                'worker-uid',
                'days-of-sickness',
              ]);
            });
          });
        });
      });

      describe('for other contract types', () => {
        otherContractTypes.forEach((contractType) => {
          ['Save and continue', 'Skip this question'].forEach((buttonClicked) => {
            it(`should navigate to 'contract-with-zero-hours' question on ${buttonClicked} - ${contractType}`, async () => {
              const { getByText, routerSpy } = await setup({
                insideFlow: true,
                worker: { uid: 'worker-uid', contract: contractType },
              });

              const button = getByText('Save and continue');
              userEvent.click(button);

              expect(routerSpy).toHaveBeenCalledWith([
                '/workplace',
                'mocked-uid',
                'staff-record',
                'worker-uid',
                'contract-with-zero-hours',
              ]);
            });
          });
        });
      });

      it('should navigate to staff summary page when "View this staff record" is clicked', async () => {
        const { getByText, routerSpy } = await setup({
          insideFlow: true,
          worker: { uid: 'worker-uid' },
        });

        userEvent.click(getByText('View this staff record'));

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-record',
          'worker-uid',
          'staff-record-summary',
        ]);
      });
    });
  });
});
