import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { MentalHealthProfessionalComponent } from './mental-health-professional.component';

describe('MentalHealtProfessionalComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      MentalHealthProfessionalComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: insideFlow ? 'mocked-uid' : 'staff-record-summary' }],
                },
              },
              snapshot: {
                params: {},
              },
            },
          },
          {
            provide: WorkerService,
            useClass: MockWorkerServiceWithUpdateWorker,
          },
        ],
      },
    );

    const injector = getTestBed();

    const component = fixture.componentInstance;
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService);

    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerServiceSpy = spyOn(workerService, 'updateWorker').and.callThrough();

    return {
      component,
      fixture,
      router,
      routerSpy,
      submitSpy,
      workerServiceSpy,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the MentalHealtProfessionalComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the MentalHealtProfessionalComponent heading, subheading and radio buttons', async () => {
    const { getByText, getByLabelText, getByTestId } = await setup();

    expect(getByText('Are they an Approved Mental Health Professional?')).toBeTruthy;
    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByLabelText('Yes')).toBeTruthy();
    expect(getByLabelText('No')).toBeTruthy();
    expect(getByLabelText('I do not know')).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the worker progress bar', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  describe('navigation', () => {
    it('should submit data and navigate to recruited-from page when selecting Yes radio button and submitting from flow', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText, submitSpy, workerServiceSpy } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const yesRadio = getByLabelText('Yes');
      fireEvent.click(yesRadio);
      fixture.detectChanges();
      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ approvedMentalHealthWorker: 'Yes' });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        approvedMentalHealthWorker: 'Yes',
      });
      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'recruited-from']);
    });

    it('should submit data and navigate to recruited-from page when selecting No radio button and submitting from flow', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText, submitSpy, workerServiceSpy } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const yesRadio = getByLabelText('No');
      fireEvent.click(yesRadio);
      fixture.detectChanges();
      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ approvedMentalHealthWorker: 'No' });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        approvedMentalHealthWorker: 'No',
      });
      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'recruited-from']);
    });

    it('should submit data and navigate to recruited-from page when selecting I do not know radio button and submitting from flow', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText, submitSpy, workerServiceSpy } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const yesRadio = getByLabelText('I do not know');
      fireEvent.click(yesRadio);
      fixture.detectChanges();
      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ approvedMentalHealthWorker: `Don't know` });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        approvedMentalHealthWorker: `Don't know`,
      });
      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'recruited-from']);
    });

    it('should navigate to staff record summary when clicking the view this staff record link', async () => {
      const { component, routerSpy, getByText, submitSpy, workerServiceSpy } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const saveButton = getByText('View this staff record');
      fireEvent.click(saveButton);

      expect(submitSpy).toHaveBeenCalledWith({ action: 'summary', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('should navigate to recruited-from page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText, submitSpy, workerServiceSpy } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: false });
      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'recruited-from']);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('should submit data and navigate to staff record summary page when selecting Yes radio button and submitting outside the flow', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText, submitSpy, workerServiceSpy } = await setup(
        false,
      );

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const yesRadio = getByLabelText('Yes');
      fireEvent.click(yesRadio);
      fixture.detectChanges();
      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ approvedMentalHealthWorker: 'Yes' });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        approvedMentalHealthWorker: 'Yes',
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should submit data and navigate to staff record summary page when selecting No radio button and submitting outside the flow', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText, submitSpy, workerServiceSpy } = await setup(
        false,
      );

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const yesRadio = getByLabelText('No');
      fireEvent.click(yesRadio);
      fixture.detectChanges();
      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ approvedMentalHealthWorker: 'No' });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        approvedMentalHealthWorker: 'No',
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should submit data and navigate to staff record summary page when selecting I do not know radio button and submitting outside the flow', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText, submitSpy, workerServiceSpy } = await setup(
        false,
      );

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const yesRadio = getByLabelText('I do not know');
      fireEvent.click(yesRadio);
      fixture.detectChanges();
      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ approvedMentalHealthWorker: `Don't know` });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        approvedMentalHealthWorker: `Don't know`,
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to wdf staff-summary-page page when pressing save and return in wdf version of page', async () => {
      const { component, routerSpy, getByText, fixture, router } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const skipButton = getByText('Save and return');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });

    it('should navigate to wdf staff-summary-page page when pressing cancel in wdf version of page', async () => {
      const { component, routerSpy, getByText, fixture, router } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const skipButton = getByText('Cancel');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });
  });
});
