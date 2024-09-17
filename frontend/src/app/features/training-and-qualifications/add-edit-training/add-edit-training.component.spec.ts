import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { AddEditTrainingComponent } from './add-edit-training.component';
import { MockTrainingCategoryService, trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';
import { TrainingCategoryService } from '@core/services/training-category.service';

describe('AddEditTrainingComponent', () => {
  async function setup(trainingRecordId = '1', qsParamGetMock = sinon.fake()) {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId, getByLabelText } = await render(
      AddEditTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          WindowRef,
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                params: { trainingRecordId, establishmentuid: '24', id: 2 },
              },
              parent: {
                snapshot: {
                  data: {
                    establishment: {
                      uid: '1',
                    },
                    trainingCategories: trainingCategories,
                  },
                },
              },
            },
          },
          UntypedFormBuilder,
          ErrorSummaryService,
          { provide: TrainingService, useClass: MockTrainingService },
          { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
          { provide: TrainingCategoryService, useClass: MockTrainingCategoryService },
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService);
    const updateSpy = spyOn(workerService, 'updateTrainingRecord').and.returnValue(of(null));
    const createSpy = spyOn(workerService, 'createTrainingRecord').and.callThrough();

    const component = fixture.componentInstance;
    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert');

    const trainingService = injector.inject(TrainingService) as TrainingService;

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
      updateSpy,
      createSpy,
      workerService,
      alertServiceSpy,
      trainingService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workers name', async () => {
    const { component, getByText } = await setup();
    expect(getByText(component.worker.nameOrId, { exact: false })).toBeTruthy();
  });

  describe('Training category display', async () => {
    it('should show the training category displayed as text when there is a training category present and update the form value', async () => {
      const qsParamGetMock = sinon.stub();
      const { component, fixture, getByText, getByTestId, queryByTestId, workerService } = await setup(
        null,
        qsParamGetMock,
      );

      component.trainingCategory = {
        category: 'Autism',
        id: 2,
      };

      spyOn(workerService, 'getTrainingRecord').and.returnValue(of(null));
      component.ngOnInit();
      fixture.detectChanges();

      const { form } = component;
      const expectedFormValue = {
        title: null,
        accredited: null,
        completed: { day: null, month: null, year: null },
        expires: { day: null, month: null, year: null },
        notes: null,
        uploadCertificate: null,
      };

      expect(getByTestId('trainingCategoryDisplay')).toBeTruthy();
      expect(getByText('Autism')).toBeTruthy();
      expect(form.value).toEqual(expectedFormValue);
    });

    it('should show the training category displayed as text with a change link when there is a training category present and update the form value', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId, trainingService } = await setup(null);

      trainingService.setSelectedTrainingCategory({
        id: 1,
        seq: 20,
        category: 'Autism',
        trainingCategoryGroup: 'Specific conditions and disabilities',
      });

      component.ngOnInit();
      fixture.detectChanges();

      const { form } = component;
      const expectedFormValue = {
        title: null,
        accredited: null,
        completed: { day: null, month: null, year: null },
        expires: { day: null, month: null, year: null },
        notes: null,
        uploadCertificate: null,
      };

      expect(getByTestId('trainingCategoryDisplay')).toBeTruthy();
      expect(getByText('Autism')).toBeTruthy();
      expect(form.value).toEqual(expectedFormValue);
      expect(getByTestId('changeTrainingCategoryLink')).toBeTruthy();
    });

    it('should show the training category displayed as text when editing an existing training record', async () => {
      const { getByText, getByTestId } = await setup();

      expect(getByTestId('trainingCategoryDisplay')).toBeTruthy();
      expect(getByText('Communication')).toBeTruthy();
    });
  });

  describe('title', () => {
    it('should render the Add training record details title', async () => {
      const trainingRecordId = null;
      const { getByText } = await setup(trainingRecordId);

      expect(getByText('Add training record details')).toBeTruthy();
    });

    it('should render the Training details title, when there is a training record id', async () => {
      const { getByText } = await setup();

      expect(getByText('Training record details')).toBeTruthy();
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
        accredited: 'Yes',
        completed: { day: 2, month: '1', year: 2020 },
        expires: { day: 2, month: '1', year: 2021 },
        notes: undefined,
        uploadCertificate: null,
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
        accredited: null,
        completed: { day: null, month: null, year: null },
        expires: { day: null, month: null, year: null },
        notes: null,
        uploadCertificate: null,
      };
      expect(form.value).toEqual(expectedFormValue);
    });

    it('should not call getTrainingRecord if there is no trainingRecordId', async () => {
      const { component, workerService } = await setup(null);

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
      const { getByText, queryByTestId } = await setup(null);

      expect(getByText('Save record')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(queryByTestId('deleteButton')).toBeFalsy();
    });

    it('should render a upload file button', async () => {
      const { component, getByTestId } = await setup(null);

      component.ngOnInit();

      const certificateUploadSection = getByTestId('uploadCertificate');
      expect(certificateUploadSection).toBeTruthy();

      const uploadButton = within(certificateUploadSection).getByTestId('fileInput');
      expect(uploadButton).toBeTruthy();
    });
  });

  describe('Delete button', () => {
    it('should navigate to delete confirmation page with training category', async () => {
      const { component, routerSpy, getByTestId, fixture } = await setup();
      const deleteTrainingRecord = getByTestId('deleteButton');
      component.trainingCategory = { id: 2, category: 'First aid' };
      fixture.detectChanges();

      fireEvent.click(deleteTrainingRecord);
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        component.worker.uid,
        'training',
        component.trainingRecordId,
        { trainingCategory: JSON.stringify(component.trainingCategory) },
        'delete',
      ]);
    });

    it('should navigate to delete confirmation page without training category', async () => {
      const { component, routerSpy, getByTestId } = await setup();
      const deleteTrainingRecord = getByTestId('deleteButton');
      fireEvent.click(deleteTrainingRecord);
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        component.worker.uid,
        'training',
        component.trainingRecordId,
        { trainingCategory: JSON.stringify(component.trainingCategory) },
        'delete',
      ]);
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
      const { component, fixture, getByText, getByLabelText, updateSpy, routerSpy, alertServiceSpy } = await setup();

      component.previousUrl = ['/goToPreviousUrl'];
      fixture.detectChanges();

      userEvent.type(getByLabelText('Notes'), 'Some notes added to this training');
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const expectedFormValue = {
        title: 'Communication Training 1',
        accredited: 'Yes',
        completed: { day: 2, month: '1', year: 2020 },
        expires: { day: 2, month: '1', year: 2021 },
        notes: 'Some notes added to this training',
        uploadCertificate: null,
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

      fixture.whenStable().then(() => {
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Training record updated',
        });
      });
    });

    it('should call the createTrainingRecord function if adding a new training record, and navigate away from page', async () => {
      const { component, fixture, getByText, getByTestId, getByLabelText, createSpy, routerSpy, alertServiceSpy } =
        await setup(null);

      component.previousUrl = ['/goToPreviousUrl'];
      fixture.detectChanges();

      component.trainingCategory = {
        id: component.categories[0].id,
        category: component.categories[0].category,
      };

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
        accredited: 'Yes',
        completed: { day: 10, month: 4, year: 2020 },
        expires: { day: 10, month: 4, year: 2022 },
        notes: 'Some notes for this training',
        uploadCertificate: null,
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

      fixture.whenStable().then(() => {
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Training record added',
        });
      });
    });

    it('should reset the training category selected for training record in the service on submit', async () => {
      const { component, fixture, getByText, getByLabelText, trainingService, routerSpy } = await setup(null);

      trainingService.setSelectedTrainingCategory({
        id: 2,
        seq: 20,
        category: 'Autism',
        trainingCategoryGroup: 'Specific conditions and disabilities',
      });

      component.ngOnInit();
      fixture.detectChanges();

      component.previousUrl = ['/goToPreviousUrl'];

      userEvent.type(getByLabelText('Training name'), 'Some training');
      userEvent.click(getByLabelText('No'));

      const trainingServiceSpy = spyOn(trainingService, 'clearSelectedTrainingCategory').and.callThrough();
      fireEvent.click(getByText('Save record'));

      expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
      expect(trainingServiceSpy).toHaveBeenCalled();

      expect(trainingService.selectedTraining.trainingCategory).toBeNull();
    });

    describe('upload certificate to existing training', () => {
      const mockUploadFile = new File(['some file content'], 'large-file.pdf', { type: 'application/pdf' });

      it('should call both `addCertificateToTraining` and `updateTrainingRecord` if an upload file is selected', async () => {
        const { component, fixture, getByText, getByLabelText, getByTestId, updateSpy, routerSpy, trainingService } =
          await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const addCertificateToTrainingSpy = spyOn(trainingService, 'addCertificateToTraining').and.returnValue(
          of(null),
        );

        userEvent.type(getByLabelText('Notes'), 'Some notes added to this training');
        userEvent.upload(getByTestId('fileInput'), mockUploadFile);
        fireEvent.click(getByText('Save and return'));
        fixture.detectChanges();

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

        expect(addCertificateToTrainingSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.trainingRecordId,
          mockUploadFile,
        );

        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
      });

      it('should not call addCertificateToTraining if no file was selected', async () => {
        const { component, fixture, getByText, getByLabelText, trainingService } = await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const addCertificateToTrainingSpy = spyOn(trainingService, 'addCertificateToTraining');

        userEvent.type(getByLabelText('Notes'), 'Some notes added to this training');
        fireEvent.click(getByText('Save and return'));

        expect(addCertificateToTrainingSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('errors', () => {
    describe('title errors', () => {
      it('should show an error message if the title is less than 3 characters long', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup(null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        userEvent.type(getByLabelText('Training name'), 'aa');

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Training name must be between 3 and 120 characters').length).toEqual(2);
      });

      it('should show an error message if the title is more than 120 characters long', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup(null);

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
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(null);

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
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(null);

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
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(null);

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
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(null);

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

      it('should show an error message if the expiry date is more than 100 years ago', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 101);

        const expiresDate = getByTestId('expiresDate');
        userEvent.type(within(expiresDate).getByLabelText('Day'), `${pastDate.getDate()}`);
        userEvent.type(within(expiresDate).getByLabelText('Month'), `${pastDate.getMonth() + 1}`);
        userEvent.type(within(expiresDate).getByLabelText('Year'), `${pastDate.getFullYear()}`);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date cannot be more than 100 years ago').length).toEqual(2);
      });

      it('should show the min date error message if expiry date is over a hundred years ago and the expiry date is before the completed date', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId, queryByText } = await setup(null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const dateCompleted = new Date();

        const completedDate = getByTestId('completedDate');
        userEvent.type(within(completedDate).getByLabelText('Day'), `${dateCompleted.getDate()}`);
        userEvent.type(within(completedDate).getByLabelText('Month'), `${dateCompleted.getMonth() + 1}`);
        userEvent.type(within(completedDate).getByLabelText('Year'), `${dateCompleted.getFullYear()}`);

        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 101);

        const expiresDate = getByTestId('expiresDate');
        userEvent.type(within(expiresDate).getByLabelText('Day'), `${pastDate.getDate()}`);
        userEvent.type(within(expiresDate).getByLabelText('Month'), `${pastDate.getMonth() + 1}`);
        userEvent.type(within(expiresDate).getByLabelText('Year'), `${pastDate.getFullYear()}`);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date cannot be more than 100 years ago').length).toEqual(2);
        expect(queryByText('Expiry date must be after date completed')).toBeFalsy();
      });

      it('should an error message when the expiry date is before the completed date', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup(null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const dateCompleted = new Date();

        const completedDate = getByTestId('completedDate');
        userEvent.type(within(completedDate).getByLabelText('Day'), `7`);
        userEvent.type(within(completedDate).getByLabelText('Month'), `${dateCompleted.getMonth() + 1}`);
        userEvent.type(within(completedDate).getByLabelText('Year'), `${dateCompleted.getFullYear()}`);
        const expiresDate = getByTestId('expiresDate');
        userEvent.type(within(expiresDate).getByLabelText('Day'), `6`);
        userEvent.type(within(expiresDate).getByLabelText('Month'), `${dateCompleted.getMonth() + 1}`);
        userEvent.type(within(expiresDate).getByLabelText('Year'), `${dateCompleted.getFullYear()}`);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date must be after date completed').length).toEqual(2);
      });
    });

    describe('notes errors', () => {
      it('should show an error message if the notes is over 1000 characters', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup(null);

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const veryLongString =
          'This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string.';

        userEvent.type(getByLabelText('Notes'), veryLongString);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Notes must be 1000 characters or fewer').length).toEqual(2);
      });

      describe('uploadCertificate errors', () => {
        it('should show an error message if the selected file is over 500 KB', async () => {
          const { component, fixture, getByTestId, getByText, getAllByText } = await setup(null);
          component.trainingCategory = {
            category: 'Autism',
            id: 2,
          };

          const mockUploadFile = new File(['some file content'], 'large-file.pdf', { type: 'application/pdf' });

          Object.defineProperty(mockUploadFile, 'size', {
            value: 10 * 1024 * 1024, // 10MB
          });

          const fileInputButton = getByTestId('fileInput') as HTMLInputElement;

          userEvent.upload(fileInputButton, mockUploadFile);
          userEvent.click(getByText('Save record'));

          fixture.detectChanges();

          expect(getAllByText('The certificate must be no larger than 500KB').length).toEqual(2);
        });

        it('should show an error message if the selected file is not a pdf file', async () => {
          const { component, fixture, getByTestId, getByText, getAllByText } = await setup(null);
          component.trainingCategory = {
            category: 'Autism',
            id: 2,
          };

          const mockUploadFile = new File(['some file content'], 'non-pdf.png', { type: 'image/png' });

          const fileInputButton = getByTestId('fileInput') as HTMLInputElement;

          userEvent.upload(fileInputButton, [mockUploadFile]);
          userEvent.click(getByText('Save record'));

          fixture.detectChanges();

          expect(getAllByText('The certificate must be a pdf file').length).toEqual(2);
        });
      });
    });
  });

  it('should redirect to the add training select category on page refresh', async () => {
    const { component, fixture, getByText, getByTestId, getByLabelText, trainingService, routerSpy } = await setup(
      null,
    );

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith([
      `workplace/${component.establishmentUid}/training-and-qualifications-record/${component.workerId}/add-training`,
    ]);
  });
});
