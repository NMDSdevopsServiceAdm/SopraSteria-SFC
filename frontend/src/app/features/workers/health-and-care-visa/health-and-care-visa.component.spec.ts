import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { HealthAndCareVisaComponent } from './health-and-care-visa.component';

describe('HealthAndCareVisaComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      HealthAndCareVisaComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: WorkerService,
            useClass: MockWorkerServiceWithUpdateWorker,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                },
              },
              snapshot: {
                params: {},
              },
            },
          },
        provideHttpClient(), provideHttpClientTesting(),],
      },
    );

    const injector = getTestBed();

    const component = fixture.componentInstance;
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerService = injector.inject(WorkerService) as WorkerService;
    const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();

    return {
      component,
      fixture,
      router,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      routerSpy,
      updateWorkerSpy,
    };
  }

  it('should render the SocialCareQualificationComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      'DHSC use the anonymised data to help them identify which roles workers with Health and Care Worker visas have. The data is also used to look at employment trends and inform recruitment policies.',
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
  });

  describe('Progress bar', () => {
    it('should render the staff record progress bar when in add staff record flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('Submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    describe('Inside flow', () => {
      it(`should navigate to inside-or-outside-of-uk page when 'Yes' is selected`, async () => {
        const { component, fixture, routerSpy, getByText, getByLabelText } = await setup();

        const radioButtonYes = getByLabelText('Yes');
        fireEvent.click(radioButtonYes);

        fixture.detectChanges();

        const saveButton = getByText('Save and continue');
        fireEvent.click(saveButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'inside-or-outside-of-uk',
        ]);
      });

      it(`should navigate to main-job-start-date page when 'No' is selected`, async () => {
        const { component, fixture, routerSpy, getByText, getByLabelText } = await setup();

        const radioButtonNo = getByLabelText('No');
        fireEvent.click(radioButtonNo);

        fixture.detectChanges();

        const saveButton = getByText('Save and continue');
        fireEvent.click(saveButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'main-job-start-date',
        ]);
      });

      it(`should navigate to main-job-start-date page when submitting from flow and 'I do not know' is selected`, async () => {
        const { component, fixture, routerSpy, getByText, getByLabelText } = await setup();

        const radioButtonUnknown = getByLabelText('I do not know');
        fireEvent.click(radioButtonUnknown);

        fixture.detectChanges();

        const saveButton = getByText('Save and continue');
        fireEvent.click(saveButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'main-job-start-date',
        ]);
      });

      it('should navigate to main-job-start-date page when you skip the question', async () => {
        const { component, routerSpy, getByText } = await setup();

        const skipButton = getByText('Skip this question');
        fireEvent.click(skipButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'main-job-start-date',
        ]);
      });
    });

    describe('Outside flow', () => {
      it('should navigate to staff-summary-page page when pressing save and No is entered', async () => {
        const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

        const radioButtonNo = getByLabelText('No');
        fireEvent.click(radioButtonNo);

        fixture.detectChanges();

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'staff-record-summary',
        ]);
      });

      it('should navigate to staff-summary-page page when pressing save and I do not know is entered', async () => {
        const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

        const radioButtonNo = getByLabelText('I do not know');
        fireEvent.click(radioButtonNo);

        fixture.detectChanges();

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'staff-record-summary',
        ]);
      });

      it('should navigate to inside-or-outside-of-uk page when pressing save and Yes is entered', async () => {
        const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

        const radioButtonNo = getByLabelText('Yes');
        fireEvent.click(radioButtonNo);

        fixture.detectChanges();

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'staff-record-summary',
          'inside-or-outside-of-uk',
        ]);
      });

      it('should navigate to staff-summary-page page when pressing cancel', async () => {
        const { component, routerSpy, getByText } = await setup(false);

        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.workplace.uid,
          'staff-record',
          component.worker.uid,
          'staff-record-summary',
        ]);
      });
    });

    describe('funding view', () => {
      const setupForWdfView = async () => {
        const { component, fixture, routerSpy, getByText, getByLabelText, router } = await setup(false);

        spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
        component.returnUrl = undefined;
        component.ngOnInit();
        fixture.detectChanges();
        const workerId = component.worker.uid;

        return { component, fixture, routerSpy, getByText, getByLabelText, router, workerId };
      };

      it('should navigate to funding staff-summary-page page when pressing save and no is entered', async () => {
        const { fixture, routerSpy, getByText, getByLabelText, workerId } = await setupForWdfView();

        const radioButtonNo = getByLabelText('No');
        fireEvent.click(radioButtonNo);

        fixture.detectChanges();

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
      });

      it('should navigate to funding staff-summary-page page when pressing save and I do not know is entered', async () => {
        const { fixture, routerSpy, getByText, getByLabelText, workerId } = await setupForWdfView();

        const radioButtonDontKnow = getByLabelText('I do not know');
        fireEvent.click(radioButtonDontKnow);

        fixture.detectChanges();

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        expect(getByText('Save')).toBeTruthy();

        expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
      });

      it('should navigate to funding inside-or-outside-of-uk page when pressing save and Yes is entered', async () => {
        const { fixture, routerSpy, getByText, getByLabelText, workerId } = await setupForWdfView();

        const radioButtonNo = getByLabelText('Yes');
        fireEvent.click(radioButtonNo);

        fixture.detectChanges();

        const saveButton = getByText('Save');
        fireEvent.click(saveButton);

        expect(getByText('Save')).toBeTruthy();

        expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId, 'inside-or-outside-of-uk']);
      });

      it('should navigate to funding staff-summary-page page when pressing cancel in funding version of page', async () => {
        const { routerSpy, getByText, workerId } = await setupForWdfView();

        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
      });
    });
  });

  describe('onSubmit', () => {
    it('should update the worker with healthAndCareVisa set to Yes when Yes selected', async () => {
      const { component, fixture, updateWorkerSpy, getByText, getByLabelText } = await setup(false);

      const radioButtonYes = getByLabelText('Yes');
      fireEvent.click(radioButtonYes);

      fixture.detectChanges();

      const saveButton = getByText('Save');
      fireEvent.click(saveButton);

      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        healthAndCareVisa: 'Yes',
      });
    });
  });

  [
    { serviceValue: 'No', databaseValue: 'No' },
    { serviceValue: 'I do not know', databaseValue: "Don't know" },
  ].forEach((answer) => {
    it(`should update the worker with healthAndCareVisa as ${answer.databaseValue} and employedFromOutsideUk set to null when ${answer.serviceValue} selected`, async () => {
      const { component, fixture, updateWorkerSpy, getByText, getByLabelText } = await setup(false);

      const radioButton = getByLabelText(answer.serviceValue);
      fireEvent.click(radioButton);

      fixture.detectChanges();

      const saveButton = getByText('Save');
      fireEvent.click(saveButton);

      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        healthAndCareVisa: answer.databaseValue,
        employedFromOutsideUk: null,
      });
    });
  });
});