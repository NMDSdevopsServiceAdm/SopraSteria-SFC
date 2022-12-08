import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { ErrorSummaryComponent } from '@shared/components/error-summary/error-summary.component';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { QuestionComponent } from '../question/question.component';
import { MainJobStartDateComponent } from './main-job-start-date.component';

const { build, fake } = require('@jackfranklin/test-data-bot');

const workerBuilder = build('Worker', {
  fields: {
    uid: fake((f) => f.datatype.uuid()),
    mainJob: {
      id: 21,
      jobId: 21,
    },
    countryOfBirth: {
      other: { countryId: 59, country: 'Denmark' },
      value: 'Other',
    },
  },
});

const createWorker = (id) =>
  workerBuilder({
    overrides: {
      mainJob: {
        id: id,
        jobId: id,
      },
    },
  });

describe('MainJobStartDateComponent', () => {
  const setup = async (insideFlow = true, worker = workerBuilder(), wdfEditPageFlag = false) => {
    const { fixture, getByText, getByLabelText, getAllByText, getByTestId, queryByTestId } = await render(
      MainJobStartDateComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [DatePickerComponent, SubmitButtonComponent, ErrorSummaryComponent, ProgressBarComponent],
        providers: [
          FormBuilder,
          ReactiveFormsModule,
          ErrorSummaryService,
          QuestionComponent,
          {
            provide: WorkerService,
            useFactory: MockWorkerServiceWithUpdateWorker.factory(worker),
            deps: [HttpClient],
          },
          {
            provide: WorkplaceService,
            useClass: MockWorkplaceService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                parent: {
                  snapshot: {
                    url: [{ path: wdfEditPageFlag ? 'wdf' : '' }],
                  },
                },
                snapshot: {
                  data: {
                    workplace: { uid: 123 },
                    primaryWorkplace: { uid: 345 },
                    establishment: {
                      uid: 123,
                    },
                  },
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                },
              },
            },
          },
          {
            provide: PermissionsService,
            useClass: MockPermissionsService,
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService);

    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerServiceSpy = spyOn(workerService, 'updateWorker').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      submitSpy,
      navigateSpy,
      workerServiceSpy,
      queryByTestId,
      getByTestId,
    };
  };

  it('renders without error', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  it('renders the correct default fields', async () => {
    const { getByText, getByLabelText } = await setup();

    expect(getByText('When did they start in their main job role?')).toBeTruthy();

    expect(getByLabelText('Day')).toBeTruthy();
    expect(getByLabelText('Month')).toBeTruthy();
    expect(getByLabelText('Year')).toBeTruthy();
  });

  it(`should show 'Save and continue' cta button and 'View this staff record' and 'Skip this question' link if in the flow`, async () => {
    const { getByText } = await setup();

    expect(getByText('Save and continue')).toBeTruthy();
    expect(getByText('View this staff record')).toBeTruthy();
    expect(getByText('Skip this question')).toBeTruthy();
  });

  it(`should show 'Save and return' cta button and 'Cancel' link if outside the flow`, async () => {
    const { getByText } = await setup(false);

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it(`should show 'Save and return' cta button and 'Cancel' link when in wdf version of page`, async () => {
    const { getByText } = await setup(false, workerBuilder(), true);

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('allows the user to complete the fields and update the form data and navigate to the other job roles page when the worker is not a nurse or social worker - (continue flow)', async () => {
    const { component, getByText, getByLabelText, fixture, submitSpy, workerServiceSpy, navigateSpy } = await setup();

    const formData = component.form.value;
    expect(formData).toEqual({ mainJobStartDate: { day: null, month: null, year: null } });

    userEvent.type(getByLabelText('Day'), '22');
    userEvent.type(getByLabelText('Month'), '12');
    userEvent.type(getByLabelText('Year'), '2000');
    userEvent.click(getByText('Save and continue'));
    fixture.detectChanges();

    const updatedFormData = component.form.value;
    expect(updatedFormData).toEqual({ mainJobStartDate: { day: 22, month: 12, year: 2000 } });

    expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
      mainJobStartDate: '2000-12-22',
    });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      fixture.componentInstance.worker.uid,
      'recruited-from',
    ]);
  });

  it('allows the user to complete the fields and update the form data and navigate to the nursing category page when the worker is a nurse - (continue flow)', async () => {
    const registeredNurse = createWorker(23);
    const { component, getByText, getByLabelText, fixture, submitSpy, workerServiceSpy, navigateSpy } = await setup(
      true,
      registeredNurse,
    );

    const formData = component.form.value;
    expect(formData).toEqual({ mainJobStartDate: { day: null, month: null, year: null } });

    userEvent.type(getByLabelText('Day'), '22');
    userEvent.type(getByLabelText('Month'), '12');
    userEvent.type(getByLabelText('Year'), '2000');
    userEvent.click(getByText('Save and continue'));
    fixture.detectChanges();

    const updatedFormData = component.form.value;
    expect(updatedFormData).toEqual({ mainJobStartDate: { day: 22, month: 12, year: 2000 } });

    expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
      mainJobStartDate: '2000-12-22',
    });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      fixture.componentInstance.worker.uid,
      'nursing-category',
    ]);
  });

  it('allows the user to complete the fields and update the form data and navigate to the mental health professional page when the worker is a social worker - (continue flow)', async () => {
    const socialWorker = createWorker(27);
    const { component, getByText, getByLabelText, fixture, submitSpy, workerServiceSpy, navigateSpy } = await setup(
      true,
      socialWorker,
    );

    const formData = component.form.value;
    expect(formData).toEqual({ mainJobStartDate: { day: null, month: null, year: null } });

    userEvent.type(getByLabelText('Day'), '22');
    userEvent.type(getByLabelText('Month'), '12');
    userEvent.type(getByLabelText('Year'), '2000');
    userEvent.click(getByText('Save and continue'));
    fixture.detectChanges();

    const updatedFormData = component.form.value;
    expect(updatedFormData).toEqual({ mainJobStartDate: { day: 22, month: 12, year: 2000 } });

    expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
      mainJobStartDate: '2000-12-22',
    });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      fixture.componentInstance.worker.uid,
      'mental-health-professional',
    ]);
  });

  it('allows the user to skip the question and navigate to other job roles page when the worker is not a nurse or social worker', async () => {
    const { fixture, getByText, submitSpy, navigateSpy, workerServiceSpy } = await setup();

    userEvent.click(getByText('Skip this question'));
    expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: false });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      fixture.componentInstance.worker.uid,
      'recruited-from',
    ]);
    expect(workerServiceSpy).not.toHaveBeenCalled();
  });

  it('allows the user to skip the question and navigate to nursing category page when the worker is a nurse', async () => {
    const registeredNurse = createWorker(23);
    const { fixture, getByText, submitSpy, navigateSpy, workerServiceSpy } = await setup(true, registeredNurse);

    userEvent.click(getByText('Skip this question'));
    expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: false });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      fixture.componentInstance.worker.uid,
      'nursing-category',
    ]);
    expect(workerServiceSpy).not.toHaveBeenCalled();
  });

  it('allows the user to skip the question and navigate to mental health professional page when the worker is a social worker', async () => {
    const socialWorker = createWorker(27);
    const { fixture, getByText, submitSpy, navigateSpy, workerServiceSpy } = await setup(true, socialWorker);

    userEvent.click(getByText('Skip this question'));
    expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: false });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      fixture.componentInstance.worker.uid,
      'mental-health-professional',
    ]);
    expect(workerServiceSpy).not.toHaveBeenCalled();
  });

  it('allows the user to view the staff record summary', async () => {
    const { component, fixture, getByText, submitSpy, navigateSpy, workerServiceSpy } = await setup();

    component.return = null;
    fixture.detectChanges();

    userEvent.click(getByText('View this staff record'));
    expect(submitSpy).toHaveBeenCalledWith({ action: 'summary', save: false });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      component.worker.uid,
      'staff-record-summary',
    ]);
    expect(workerServiceSpy).not.toHaveBeenCalled();
  });

  it('allows the user to complete the fields and update the form data and then navigate back to staff record summary page - (return flow)', async () => {
    const { getByText, getByLabelText, component, submitSpy, workerServiceSpy, navigateSpy } = await setup(false);

    const formData = component.form.value;
    expect(formData).toEqual({ mainJobStartDate: { day: null, month: null, year: null } });

    userEvent.type(getByLabelText('Day'), '11');
    userEvent.type(getByLabelText('Month'), '11');
    userEvent.type(getByLabelText('Year'), '1999');

    userEvent.click(getByText('Save and return'));

    const updatedFormData = component.form.value;
    expect(updatedFormData).toEqual({ mainJobStartDate: { day: 11, month: 11, year: 1999 } });

    expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
      mainJobStartDate: '1999-11-11',
    });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      component.worker.uid,
      'staff-record-summary',
    ]);
  });

  it('allows the user to exit when not in the flow', async () => {
    const { fixture, getByText, submitSpy, navigateSpy, workerServiceSpy } = await setup(false);

    userEvent.click(getByText('Cancel'));
    expect(submitSpy).toHaveBeenCalledOnceWith({ action: 'return', save: false });
    expect(navigateSpy).toHaveBeenCalledWith([
      '/workplace',
      123,
      'staff-record',
      fixture.componentInstance.worker.uid,
      'staff-record-summary',
    ]);
    expect(workerServiceSpy).not.toHaveBeenCalled();
  });

  it('allows the user to complete the fields and update the form data and then navigate back to the wdf staff record summary page when in wdf version of the page', async () => {
    const { getByText, getByLabelText, component, submitSpy, workerServiceSpy, navigateSpy } = await setup(
      false,
      workerBuilder(),
      true,
    );

    const formData = component.form.value;
    expect(formData).toEqual({ mainJobStartDate: { day: null, month: null, year: null } });

    userEvent.type(getByLabelText('Day'), '11');
    userEvent.type(getByLabelText('Month'), '11');
    userEvent.type(getByLabelText('Year'), '1999');

    userEvent.click(getByText('Save and return'));

    const updatedFormData = component.form.value;
    expect(updatedFormData).toEqual({ mainJobStartDate: { day: 11, month: 11, year: 1999 } });

    expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
    expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
      mainJobStartDate: '1999-11-11',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['wdf', 'staff-record', component.worker.uid]);
  });

  it('allows the user to exit when not in the flow and navigate to wdf staff record summary page when in wdf version of the page', async () => {
    const { fixture, getByText, submitSpy, navigateSpy, workerServiceSpy } = await setup(false, workerBuilder(), true);

    userEvent.click(getByText('Cancel'));
    expect(submitSpy).toHaveBeenCalledOnceWith({ action: 'return', save: false });
    expect(navigateSpy).toHaveBeenCalledWith(['wdf', 'staff-record', fixture.componentInstance.worker.uid]);
    expect(workerServiceSpy).not.toHaveBeenCalled();
  });

  describe('Error messages', () => {
    it('renders an error message component has invalid date', async () => {
      const { getAllByText, getByText, getByLabelText, fixture } = await setup();

      userEvent.type(getByLabelText('Day'), '11');
      userEvent.type(getByLabelText('Month'), '11');
      userEvent.type(getByLabelText('Year'), '11');
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const errors = getAllByText('Enter a valid main job start date, like 31 3 1980');

      expect(errors.length).toBe(2);
    });

    it('renders an error message component has main job start date is before the earliest possible start date', async () => {
      const { getAllByText, getByText, getByLabelText, fixture } = await setup();

      const dateInput = new Date();
      const day = dateInput.getDate();
      const month = dateInput.getMonth() + 1;
      const year = dateInput.getFullYear() - 100;

      userEvent.type(getByLabelText('Day'), day.toString());
      userEvent.type(getByLabelText('Month'), month.toString());
      userEvent.type(getByLabelText('Year'), year.toString());
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const errors = getAllByText(
        `Main job start date must be after ${day} ${dateInput.toLocaleString('default', { month: 'long' })} ${year}`,
      );

      expect(errors.length).toBe(2);
    });

    it('renders an error message component has a future date', async () => {
      const { getAllByText, getByText, getByLabelText, fixture } = await setup();

      const dateInput = new Date();
      const day = dateInput.getDate();
      const month = dateInput.getMonth() + 1;
      const year = dateInput.getFullYear() + 1;

      userEvent.type(getByLabelText('Day'), day.toString());
      userEvent.type(getByLabelText('Month'), month.toString());
      userEvent.type(getByLabelText('Year'), year.toString());
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const errors = getAllByText('Main job start date must be today or in the past');
      expect(errors.length).toBe(2);
    });
  });
});
