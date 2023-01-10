import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { AddEditTrainingComponent } from './add-edit-training.component';

describe('AddEditTrainingComponent', () => {
  async function setup(isMandatory = false, trainingRecordId = '1') {
    if (isMandatory) {
      window.history.pushState({ training: 'mandatory', missingRecord: { category: 'testCategory', id: 5 } }, '');
    }

    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId, getByLabelText } = await render(
      AddEditTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          WindowRef,
          AlertService,
          {
            provide: ActivatedRoute,
            useValue: new MockActivatedRoute({
              snapshot: {
                params: { trainingRecordId },
              },
              parent: {
                snapshot: {
                  data: {
                    establishment: {
                      uid: '1',
                    },
                  },
                },
              },
            }),
          },
          FormBuilder,
          ErrorSummaryService,
          { provide: TrainingService, useClass: MockTrainingService },
          { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService);
    const updateSpy = spyOn(workerService, 'updateTrainingRecord').and.callThrough();
    const createSpy = spyOn(workerService, 'createTrainingRecord').and.callThrough();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      routerSpy,
      getByText,
      getByTestId,
      getAllByText,
      queryByText,
      queryByTestId,
      getByLabelText,
      alertSpy,
      updateSpy,
      createSpy,
      workerService,
    };
  }

  afterEach(() => {
    window.history.replaceState(undefined, '');
  });

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workers name', async () => {
    const { component, getByText } = await setup();
    expect(getByText(component.worker.nameOrId, { exact: false })).toBeTruthy();
  });

  describe('Training category select/display', async () => {
    it('should show the training category select box when there is no training category is present', async () => {
      const { getByTestId, queryByTestId } = await setup(false, null);

      expect(getByTestId('trainingSelect')).toBeTruthy();
      expect(queryByTestId('trainingCategoryDisplay')).toBeFalsy();
    });

    it('should show the training category displayed as text when there is a training category present', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId } = await setup();

      component.trainingCategory = 'Autism';
      fixture.detectChanges();

      expect(getByTestId('trainingCategoryDisplay')).toBeTruthy();
      expect(queryByTestId('trainingSelect')).toBeFalsy();
      expect(getByText('Autism')).toBeTruthy();
    });
  });

  describe('title', () => {
    it('should render the Add training record details title', async () => {
      const trainingRecordId = null;
      const { getByText } = await setup(false, trainingRecordId);

      expect(getByText('Add training record details')).toBeTruthy();
    });

    it('should render the Training details title, when there is a training record id', async () => {
      const { getByText } = await setup();

      expect(getByText('Training record details')).toBeTruthy();
    });

    it('should render the Add mandatory training record title, when accessed from add mandatory training link', async () => {
      const { component, fixture, getByText } = await setup(true);

      component.mandatoryTraining = true;
      component.trainingRecordId = null;
      component.setTitle();
      fixture.detectChanges();

      expect(getByText('Add mandatory training record')).toBeTruthy();
    });

    it('should render the Mandatory training record title, when accessed from mandatory training title', async () => {
      const { getByText } = await setup(true);

      expect(getByText('Mandatory training record')).toBeTruthy();
    });
  });

  describe('fillForm', () => {
    it('should prefill the form if there is a training record id and there is a training record', async () => {
      const { component, workerService } = await setup();
      const workerServiceSpy = spyOn(workerService, 'getTrainingRecord').and.callThrough();
      component.ngOnInit();

      const { form, workplace, worker, trainingRecordId } = component;
      const expectedFormValue = {
        title: 'Communication Training 1',
        category: 1,
        accredited: 'Yes',
        completed: { day: 2, month: '1', year: 2020 },
        expires: { day: 2, month: '1', year: 2021 },
        notes: undefined,
      };

      expect(form.value).toEqual(expectedFormValue);
      expect(workerServiceSpy).toHaveBeenCalledWith(workplace.uid, worker.uid, trainingRecordId);
    });

    it('should not prefill the form if there is a training record id but there is no training record', async () => {
      const { component, workerService } = await setup();
      spyOn(workerService, 'getTrainingRecord').and.returnValue(of(null));
      component.ngOnInit();
      const { form } = component;

      const expectedFormValue = {
        title: null,
        category: null,
        accredited: null,
        completed: { day: null, month: null, year: null },
        expires: { day: null, month: null, year: null },
        notes: null,
      };
      expect(form.value).toEqual(expectedFormValue);
    });

    it('should not call getTrainingRecord if there is no trainingRecordId', async () => {
      const { component, workerService } = await setup(false, null);

      const workerServiceSpy = spyOn(workerService, 'getTrainingRecord').and.callThrough();
      component.ngOnInit();

      expect(workerServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('buttons', () => {
    it('should render the Delete, Save and return and Cancel button when editing training', async () => {
      const { getByTestId, getByText } = await setup();

      expect(getByTestId('deleteButton')).toBeTruthy();
      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should render the Save record and Cancel button but not the delete button when there is no training id', async () => {
      const { getByText, queryByTestId } = await setup(false, null);

      expect(getByText('Save record')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(queryByTestId('deleteButton')).toBeFalsy();
    });
  });

  describe('Cancel button', () => {
    it('should call navigate when pressing cancel', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();
      component.previousUrl = ['/dashboard?view=categories#training-and-qualifications'];
      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);
      fixture.detectChanges();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard?view=categories#training-and-qualifications']);
    });
  });

  describe('submitting form', () => {
    it('should call the updateTrainingRecord function if editing existing training, and navigate away from page', async () => {
      const { component, fixture, getByText, getByLabelText, updateSpy, routerSpy } = await setup();

      component.previousUrl = ['/goToPreviousUrl'];
      fixture.detectChanges();

      userEvent.type(getByLabelText('Notes'), 'Some notes added to this training');
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const expectedFormValue = {
        title: 'Communication Training 1',
        category: 1,
        accredited: 'Yes',
        completed: { day: 2, month: '1', year: 2020 },
        expires: { day: 2, month: '1', year: 2021 },
        notes: 'Some notes added to this training',
      };

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual(expectedFormValue);
      expect(updateSpy).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
        component.trainingRecordId,
        {
          trainingCategory: { id: 1 },
          title: 'Communication Training 1',
          accredited: 'Yes',
          completed: '2020-01-02',
          expires: '2021-01-02',
          notes: 'Some notes added to this training',
        },
      );
      expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
    });

    it('should show an alert when successfully updating non mandatory training', async () => {
      const { component, fixture, getByText, alertSpy } = await setup();

      component.previousUrl = ['/goToPreviousUrl'];
      fixture.detectChanges();

      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Training record updated',
      });
    });

    it('should show an alert when successfully updating mandatory training', async () => {
      const { component, fixture, getByText, alertSpy } = await setup(true);

      component.previousUrl = ['/goToPreviousUrl'];
      fixture.detectChanges();

      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Mandatory training record added',
      });
    });

    it('should call the createTrainingRecord function if adding a new training record, and navigate away from page', async () => {
      const { component, fixture, getByText, getByTestId, getByLabelText, createSpy, routerSpy } = await setup(
        false,
        null,
      );

      component.previousUrl = ['/goToPreviousUrl'];
      fixture.detectChanges();

      userEvent.selectOptions(getByLabelText('Training category'), `${component.categories[0].id}`);
      userEvent.type(getByLabelText('Training name'), 'Some training');
      userEvent.click(getByLabelText('Yes'));
      const completedDate = getByTestId('completedDate');
      userEvent.type(within(completedDate).getByLabelText('Day'), '10');
      userEvent.type(within(completedDate).getByLabelText('Month'), '4');
      userEvent.type(within(completedDate).getByLabelText('Year'), '2020');
      const expiresDate = getByTestId('expiresDate');
      userEvent.type(within(expiresDate).getByLabelText('Day'), '10');
      userEvent.type(within(expiresDate).getByLabelText('Month'), '4');
      userEvent.type(within(expiresDate).getByLabelText('Year'), '2022');
      userEvent.type(getByLabelText('Notes'), 'Some notes for this training');

      fireEvent.click(getByText('Save record'));
      fixture.detectChanges();

      const expectedFormValue = {
        title: 'Some training',
        category: '1',
        accredited: 'Yes',
        completed: { day: 10, month: 4, year: 2020 },
        expires: { day: 10, month: 4, year: 2022 },
        notes: 'Some notes for this training',
      };

      const formData = component.form.value;
      expect(formData).toEqual(expectedFormValue);
      expect(createSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        trainingCategory: { id: 1 },
        title: 'Some training',
        accredited: 'Yes',
        completed: '2020-04-10',
        expires: '2022-04-10',
        notes: 'Some notes for this training',
      });
      expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
    });

    it('should show an alert when successfully adding a training record', async () => {
      const { component, fixture, getByText, getByLabelText, getByTestId, workerService } = await setup(false, null);

      const alertSetterSpy = spyOnProperty(workerService, 'alert', 'set').and.callThrough();

      component.previousUrl = ['/goToPreviousUrl'];
      fixture.detectChanges();

      userEvent.selectOptions(getByLabelText('Training category'), `${component.categories[0].id}`);
      userEvent.type(getByLabelText('Training name'), 'Some training');
      userEvent.click(getByLabelText('Yes'));
      const completedDate = getByTestId('completedDate');
      userEvent.type(within(completedDate).getByLabelText('Day'), '10');
      userEvent.type(within(completedDate).getByLabelText('Month'), '4');
      userEvent.type(within(completedDate).getByLabelText('Year'), '2020');
      const expiresDate = getByTestId('expiresDate');
      userEvent.type(within(expiresDate).getByLabelText('Day'), '10');
      userEvent.type(within(expiresDate).getByLabelText('Month'), '4');
      userEvent.type(within(expiresDate).getByLabelText('Year'), '2022');
      userEvent.type(getByLabelText('Notes'), 'Some notes for this training');

      fireEvent.click(getByText('Save record'));
      fixture.detectChanges();

      expect(alertSetterSpy).toHaveBeenCalledWith({ type: 'success', message: 'Training has been added' });
    });
  });

  describe('errors', () => {
    describe('category errors', () => {
      it('should show an error message if a category is not selected', async () => {
        const { component, fixture, getByText, getAllByText } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Select the training category').length).toEqual(3);
      });
    });

    describe('title errors', () => {
      it('should show an error message if the title is less than 3 characters long', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        userEvent.type(getByLabelText('Training name'), 'aa');

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Training name must be between 3 and 120 characters').length).toEqual(2);
      });

      it('should show an error message if the title is more than 120 characters long', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        userEvent.type(
          getByLabelText('Training name'),
          'long title long title long title long title long title long title long title long title long title long title long titles',
        );

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Training name must be between 3 and 120 characters').length).toEqual(2);
      });
    });

    describe('completed date errors', () => {
      it('should show an error message if the completed date is invalid', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const completedDate = getByTestId('completedDate');
        userEvent.type(within(completedDate).getByLabelText('Day'), '44');
        userEvent.type(within(completedDate).getByLabelText('Month'), '33');
        userEvent.type(within(completedDate).getByLabelText('Year'), '2');

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Date completed must be a valid date').length).toEqual(2);
      });

      it('should show an error message if the completed date is in the future', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const completedDate = getByTestId('completedDate');
        userEvent.type(within(completedDate).getByLabelText('Day'), `${futureDate.getDate()}`);
        userEvent.type(within(completedDate).getByLabelText('Month'), `${futureDate.getMonth() + 1}`);
        userEvent.type(within(completedDate).getByLabelText('Year'), `${futureDate.getFullYear()}`);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Date completed must be before today').length).toEqual(2);
      });

      it('should show an error message if the completed date is more than 100 years ago', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 101);

        const completedDate = getByTestId('completedDate');
        userEvent.type(within(completedDate).getByLabelText('Day'), `${pastDate.getDate()}`);
        userEvent.type(within(completedDate).getByLabelText('Month'), `${pastDate.getMonth() + 1}`);
        userEvent.type(within(completedDate).getByLabelText('Year'), `${pastDate.getFullYear()}`);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Date completed cannot be more than 100 years ago').length).toEqual(2);
      });
    });

    describe('expires date errors', () => {
      it('should show an error message if the expiry date is invalid', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const expiresDate = getByTestId('expiresDate');
        userEvent.type(within(expiresDate).getByLabelText('Day'), '44');
        userEvent.type(within(expiresDate).getByLabelText('Month'), '33');
        userEvent.type(within(expiresDate).getByLabelText('Year'), '2');

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date must be a valid date').length).toEqual(2);
      });

      it('should show an error message if the expiry date is before in the completed', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const dateCompleted = new Date();

        const completedDate = getByTestId('completedDate');
        userEvent.type(within(completedDate).getByLabelText('Day'), `${dateCompleted.getDate()}`);
        userEvent.type(within(completedDate).getByLabelText('Month'), `${dateCompleted.getMonth() + 1}`);
        userEvent.type(within(completedDate).getByLabelText('Year'), `${dateCompleted.getFullYear()}`);
        const expiresDate = getByTestId('expiresDate');
        userEvent.type(within(expiresDate).getByLabelText('Day'), `${dateCompleted.getDate() - 1}`);
        userEvent.type(within(expiresDate).getByLabelText('Month'), `${dateCompleted.getMonth() + 1}`);
        userEvent.type(within(expiresDate).getByLabelText('Year'), `${dateCompleted.getFullYear()}`);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date must be after date completed').length).toEqual(2);
      });

      fit('should show an error message if the expiry date is filled out and the completed date is not', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const dateExpires = new Date();

        const expiresDate = getByTestId('expiresDate');
        userEvent.type(within(expiresDate).getByLabelText('Day'), `${dateExpires.getDate() - 1}`);
        userEvent.type(within(expiresDate).getByLabelText('Month'), `${dateExpires.getMonth() + 1}`);
        userEvent.type(within(expiresDate).getByLabelText('Year'), `${dateExpires.getFullYear()}`);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();
        console.log(component.form.value);
        expect(getAllByText('Expiry date must be after date completed').length).toEqual(2);
      });
    });

    describe('notes errors', () => {
      it('should show an error message if the notes is over 1000 characters', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup(false, null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const veryLongString =
          'This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string.';

        userEvent.type(getByLabelText('Notes'), veryLongString);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Notes must be 1000 characters or fewer').length).toEqual(2);
      });
    });
  });
});
