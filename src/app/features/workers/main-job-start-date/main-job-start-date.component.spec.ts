import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { ErrorSummaryComponent } from '@shared/components/error-summary/error-summary.component';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { QuestionComponent } from '../question/question.component';
import { MainJobStartDateComponent } from './main-job-start-date.component';

describe('MainJobStartDateComponent', () => {
  const setup = async (navigatedFrom = null) => {
    if (navigatedFrom) history.pushState({ navigatedFrom }, '', '');

    const component = await render(MainJobStartDateComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      declarations: [DatePickerComponent, SubmitButtonComponent, ErrorSummaryComponent],
      providers: [
        BackService,
        FormBuilder,
        ReactiveFormsModule,
        ErrorSummaryService,
        QuestionComponent,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  workplace: { uid: 123 },
                  primaryWorkplace: { uid: 345 },
                  establishment: {
                    uid: 123,
                  },
                },
              },
            },
          },
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService);

    const submitSpy = spyOn(component.fixture.componentInstance, 'onSubmit').and.callThrough();
    const navigateSpy = spyOn(router, 'navigate');
    const workerServiceSpy = spyOn(workerService, 'updateWorker').and.callThrough();

    return { ...component, submitSpy, navigateSpy, workerServiceSpy };
  };

  afterEach(() => {
    window.history.replaceState(undefined, '');
  });

  it('renders without error', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('renders the correct default fields', async () => {
    const { getByText, getByLabelText } = await setup();

    expect(getByText('When did they start in their main job role?')).toBeTruthy();

    expect(getByLabelText('Day')).toBeTruthy();
    expect(getByLabelText('Month')).toBeTruthy();
    expect(getByLabelText('Year')).toBeTruthy();

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('renders "Save and continue" if clicking through from staff-records section of dashhboard', async () => {
    const { getByText } = await setup('staff-records');

    expect(getByText('Save and continue')).toBeTruthy();
    expect(getByText('View this staff record')).toBeTruthy();
  });

  it('renders "Save and continue" if clicking through from mandatory-details section page', async () => {
    const { getByText } = await setup('mandatory-details');

    expect(getByText('Save and continue')).toBeTruthy();
    expect(getByText('View this staff record')).toBeTruthy();
  });

  it('allows the user to complete the fields and update the form data - (return flow)', async () => {
    const { getByRole, getByLabelText, fixture, submitSpy, workerServiceSpy } = await setup();

    const formData = fixture.componentInstance.form.value;
    expect(formData).toEqual({ mainJobStartDate: { day: null, month: null, year: null } });

    userEvent.type(getByLabelText('Day'), '11');
    userEvent.type(getByLabelText('Month'), '11');
    userEvent.type(getByLabelText('Year'), '1999');

    userEvent.click(getByRole('button', { name: 'Save and return' }));

    const updatedFormData = fixture.componentInstance.form.value;
    expect(updatedFormData).toEqual({ mainJobStartDate: { day: 11, month: 11, year: 1999 } });

    expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
    expect(workerServiceSpy).toHaveBeenCalledWith(
      fixture.componentInstance.workplace.uid,
      fixture.componentInstance.worker.uid,
      { mainJobStartDate: '1999-11-11' },
    );
  });

  it('allows the user to complete the fields and update the form data - (continue flow)', async () => {
    const { getByRole, getByLabelText, fixture, submitSpy, workerServiceSpy } = await setup('staff-records');

    const formData = fixture.componentInstance.form.value;
    expect(formData).toEqual({ mainJobStartDate: { day: null, month: null, year: null } });

    userEvent.type(getByLabelText('Day'), '22');
    userEvent.type(getByLabelText('Month'), '12');
    userEvent.type(getByLabelText('Year'), '2000');

    userEvent.click(getByRole('button', { name: 'Save and continue' }));

    const updatedFormData = fixture.componentInstance.form.value;
    expect(updatedFormData).toEqual({ mainJobStartDate: { day: 22, month: 12, year: 2000 } });

    expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
    expect(workerServiceSpy).toHaveBeenCalledWith(
      fixture.componentInstance.workplace.uid,
      fixture.componentInstance.worker.uid,
      { mainJobStartDate: '2000-12-22' },
    );
  });

  it('allows the user to view the staff record summary', async () => {
    const { fixture, getByText, submitSpy, navigateSpy, workerServiceSpy } = await setup('staff-records');

    userEvent.click(getByText('View this staff record'));
    expect(submitSpy).toHaveBeenCalledWith({ action: 'summary', save: false });
    expect(navigateSpy).toHaveBeenCalledWith(['/workplace', 123, 'staff-record', fixture.componentInstance.worker.uid]);
    expect(workerServiceSpy).not.toHaveBeenCalled();
  });

  it('allows the user to exit the flow', async () => {
    const { getByText, submitSpy, navigateSpy, workerServiceSpy } = await setup();

    userEvent.click(getByText('Cancel'));
    expect(submitSpy).toHaveBeenCalledOnceWith({ action: 'return', save: false });
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    expect(workerServiceSpy).not.toHaveBeenCalled();
  });

  it('renders an error message component has invalid date', async () => {
    const { getAllByText, getByLabelText, fixture } = await setup();

    userEvent.type(getByLabelText('Day'), '11');
    userEvent.type(getByLabelText('Month'), '11');
    userEvent.type(getByLabelText('Year'), '11');

    fixture.componentInstance.submitted = true;
    fixture.componentInstance.form.value.errors = true;
    fixture.detectChanges();

    const errors = getAllByText('Main job start date is not a valid date');
    expect(errors.length).toBe(2);
  });
});
