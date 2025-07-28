import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AdultSocialCareStartedComponent } from './adult-social-care-started.component';

fdescribe('AdultSocialCareStartedComponent', () => {
  async function setup(overrides: any = {}) {
    const insideFlow = overrides?.insideFlow ?? true;
    const contractType = overrides?.contractType ?? Contracts.Permanent;
    const staffDoDelegatedHealthcareActivities = overrides?.staffDoDelegatedHealthcareActivities ?? 'No';
    const workerMainJobOverride = overrides?.workerMainJob ? { mainJob: overrides?.workerMainJob } : {};

    const mockWorker = workerBuilder({
      overrides: {
        contract: contractType,
        ...workerMainJobOverride,
      },
    }) as Worker;

    const setupTools = await render(AdultSocialCareStartedComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                data: {
                  establishment: { uid: 'mocked-uid', staffDoDelegatedHealthcareActivities },
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
          useFactory: MockWorkerServiceWithoutReturnUrl.factory(mockWorker),
          deps: [HttpClient],
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      router,
      routerSpy,
    };
  }

  it('should render the AdultSocialCareStartedComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup({ insideFlow: false });

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('when inside add new worker workflow', () => {
    function runTestForSkippingDHAQuestion(overrides) {
      it(`should call submit data and navigate with the  'days-of-sickness' url when 'Save and continue' is clicked and contract type is permanent pr temporary`, async () => {
        const { component, getByText, routerSpy } = await setup({
          insideFlow: true,
          contractType: Contracts.Permanent,
          ...overrides,
        });

        const button = getByText('Save and continue');
        fireEvent.click(button);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-record',
          component.worker.uid,
          'days-of-sickness',
        ]);
      });

      it(`should call submit data and navigate with the 'contract-with-zero-hours' url when 'Save and continue' is clicked and the contract typs is not permanent or temporary`, async () => {
        const { component, getByText, routerSpy } = await setup({
          insideFlow: true,
          contractType: Contracts.Other,
          ...overrides,
        });

        const button = getByText('Save and continue');
        fireEvent.click(button);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-record',
          component.worker.uid,
          'contract-with-zero-hours',
        ]);
      });

      it(`should call submit data and navigate with the  'days-of-sickness' url when 'Skip this question' is clicked and contract type is permanent pr temporary`, async () => {
        const { component, getByText, routerSpy } = await setup({
          insideFlow: true,
          contractType: Contracts.Permanent,
          ...overrides,
        });

        const button = getByText('Skip this question');
        fireEvent.click(button);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-record',
          component.worker.uid,
          'days-of-sickness',
        ]);
      });

      it(`should call submit data and navigate with the 'contract-with-zero-hours' url when 'Skip this question' is clicked and the contract typs is not permanent or temporary`, async () => {
        const { component, getByText, routerSpy } = await setup({
          insideFlow: true,
          contractType: Contracts.Other,
          ...overrides,
        });

        const button = getByText('Skip this question');
        fireEvent.click(button);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-record',
          component.worker.uid,
          'contract-with-zero-hours',
        ]);
      });
    }

    const runTestsForNavigatingToDHAQuestion = (overrides) => {
      it("should navigate to 'carry-out-delegated-healthcare-activities' question on submit", async () => {
        const { component, getByText, routerSpy } = await setup({
          insideFlow: true,
          ...overrides,
        });

        const button = getByText('Save and continue');
        fireEvent.click(button);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-record',
          component.worker.uid,
          'carry-out-delegated-healthcare-activities',
        ]);
      });

      it('should navigate to carryOutDelegatedHealthActivities question on skip', async () => {
        const { component, getByText, routerSpy } = await setup({
          insideFlow: true,
          ...overrides,
        });

        const button = getByText('Skip this question');
        fireEvent.click(button);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-record',
          component.worker.uid,
          'carry-out-delegated-healthcare-activities',
        ]);
      });
    };

    describe('when the workplace has answered "Yes" to "canDoDelegatedHealthActivities" question', () => {
      const overrides = {
        staffDoDelegatedHealthcareActivities: 'Yes',
      };

      runTestForSkippingDHAQuestion(overrides);
    });

    describe('when the workplace has not answered the "canDoDelegatedHealthActivities" question', () => {
      const overrides = {
        staffDoDelegatedHealthcareActivities: 'Yes',
      };
      runTestForSkippingDHAQuestion(overrides);
    });

    describe('when the workplace has answered "No" to "canDoDelegatedHealthActivities" question', () => {
      describe("when worker's job role cannot carry out delegated healthcare activities", () => {
        const overrides = {
          staffDoDelegatedHealthcareActivities: 'No',
          workerMainJob: {
            id: 36,
            title: 'IT manager',
            canDoDelegatedHealthcareActivities: false,
          },
        };

        runTestForSkippingDHAQuestion(overrides);
      });

      describe("when worker's job role can carry out delegated healthcare activities", () => {
        const overrides = {
          staffDoDelegatedHealthcareActivities: 'No',
          workerMainJob: {
            id: 10,
            title: 'Care worker',
            canDoDelegatedHealthcareActivities: true,
          },
        };

        runTestsForNavigatingToDHAQuestion(overrides);
      });
    });

    it(`should navigate to 'staff-summary-page' page when clicking 'View this staff record' link `, async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const viewStaffRecord = getByText('View this staff record');
      fireEvent.click(viewStaffRecord);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    describe('progress bar', () => {
      it('should render the progress bar when in the flow', async () => {
        const { getByTestId } = await setup({ insideFlow: true });

        expect(getByTestId('progress-bar')).toBeTruthy();
      });

      it('should not render the progress bar when outside the flow', async () => {
        const { queryByTestId } = await setup({ insideFlow: false });

        expect(queryByTestId('progress-bar')).toBeFalsy();
      });
    });
  });

  describe('when editing worker', () => {
    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, routerSpy, getByText } = await setup({ insideFlow: false });

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Save and return');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup({ insideFlow: false });

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to funding staff-summary-page page when pressing save and return in funding page version', async () => {
      const { component, router, fixture, routerSpy, getByText } = await setup({
        insideFlow: false,
      });
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const link = getByText('Save and return');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });

    it('should navigate to funding staff-summary-page page when pressing cancel in funding page version', async () => {
      const { component, router, routerSpy, getByText, fixture } = await setup({
        insideFlow: false,
      });
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });
  });
});
