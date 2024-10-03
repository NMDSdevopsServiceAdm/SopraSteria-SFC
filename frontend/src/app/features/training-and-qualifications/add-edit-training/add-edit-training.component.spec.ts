import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockTrainingCategoryService, trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { trainingRecord } from '@core/test-utils/MockWorkerService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { CertificationsTableComponent } from '@shared/components/certifications-table/certifications-table.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import sinon from 'sinon';

import { SelectUploadFileComponent } from '../../../shared/components/select-upload-file/select-upload-file.component';
import { AddEditTrainingComponent } from './add-edit-training.component';

describe('AddEditTrainingComponent', () => {
  async function setup(trainingRecordId = '1', qsParamGetMock = sinon.fake()) {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId, getByLabelText } = await render(
      AddEditTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [CertificationsTableComponent, SelectUploadFileComponent],
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

  describe('Notes section', () => {
    it('should have the notes section closed on page load', async () => {
      const { getByText, getByTestId } = await setup();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Open notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).toContain('govuk-visually-hidden');
    });

    it('should display the notes section after clicking Open notes', async () => {
      const { fixture, getByText, getByTestId } = await setup();
      const openNotesButton = getByText('Open notes');
      openNotesButton.click();

      fixture.detectChanges();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Close notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
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
      };

      expect(form.value).toEqual(expectedFormValue);
      expect(workerServiceSpy).toHaveBeenCalledWith(workplace.uid, worker.uid, trainingRecordId);
    });

    it('should open the notes section if there are some notes in record', async () => {
      const mockTrainingWithNotes = {
        trainingCategory: { id: 1, category: 'Communication' },
        notes: 'some notes about this training',
      };
      const { component, fixture, workerService, getByTestId, getByText } = await setup();

      spyOn(workerService, 'getTrainingRecord').and.returnValue(of(mockTrainingWithNotes));
      component.ngOnInit();
      fixture.detectChanges();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Close notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
      const notesTextArea = within(notesSection).getByRole('textbox', { name: 'Add a note' }) as HTMLTextAreaElement;
      expect(notesTextArea.value).toEqual('some notes about this training');
    });

    it('should display the remaining character count correctly if there are some notes in record', async () => {
      const mockTrainingWithNotes = {
        trainingCategory: { id: 1, category: 'Communication' },
        notes: 'some notes about this training',
      };
      const { component, fixture, workerService, getByText } = await setup();

      spyOn(workerService, 'getTrainingRecord').and.returnValue(of(mockTrainingWithNotes));
      component.ngOnInit();
      fixture.detectChanges();

      const expectedRemainingCharCounts = component.notesMaxLength - 'some notes about this training'.length;
      expect(getByText(`You have ${expectedRemainingCharCounts} characters remaining`)).toBeTruthy;
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

  describe('Upload file button', () => {
    it('should render a file input element', async () => {
      const { getByTestId } = await setup(null);

      const uploadSection = getByTestId('uploadCertificate');
      expect(uploadSection).toBeTruthy();

      const fileInput = within(uploadSection).getByTestId('fileInput');
      expect(fileInput).toBeTruthy();
    });

    it('should render "No file chosen" beside the file input', async () => {
      const { getByTestId } = await setup(null);

      const uploadSection = getByTestId('uploadCertificate');

      const text = within(uploadSection).getByText('No file chosen');
      expect(text).toBeTruthy();
    });

    it('should not render "No file chosen" when a file is chosen', async () => {
      const { fixture, getByTestId } = await setup(null);

      const uploadSection = getByTestId('uploadCertificate');
      const fileInput = getByTestId('fileInput');

      userEvent.upload(fileInput, new File(['some file content'], 'cert.pdf'));

      fixture.detectChanges();

      const text = within(uploadSection).queryByText('No file chosen');
      expect(text).toBeFalsy();
    });

    it('should provide aria description to screen reader users', async () => {
      const { fixture, getByTestId } = await setup(null);
      fixture.autoDetectChanges();

      const uploadSection = getByTestId('uploadCertificate');
      const fileInput = getByTestId('fileInput');

      let uploadButton = within(uploadSection).getByRole('button', {
        description: /The certificate must be a PDF file that's no larger than 500KB/,
      });
      expect(uploadButton).toBeTruthy();

      userEvent.upload(fileInput, new File(['some file content'], 'cert.pdf'));

      uploadButton = within(uploadSection).getByRole('button', {
        description: '1 file chosen',
      });
      expect(uploadButton).toBeTruthy();
    });
  });

  describe('submitting form', () => {
    it('should call the updateTrainingRecord function if editing existing training, and navigate away from page', async () => {
      const { component, fixture, getByText, getByLabelText, updateSpy, routerSpy, alertServiceSpy } = await setup();

      component.previousUrl = ['/goToPreviousUrl'];
      const openNotesButton = getByText('Open notes');
      openNotesButton.click();
      fixture.detectChanges();

      userEvent.type(getByLabelText('Add a note'), 'Some notes added to this training');
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const expectedFormValue = {
        title: 'Communication Training 1',
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
      const openNotesButton = getByText('Open notes');
      openNotesButton.click();
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
      userEvent.type(getByLabelText('Add a note'), 'Some notes for this training');

      fireEvent.click(getByText('Save record'));
      fixture.detectChanges();

      const expectedFormValue = {
        title: 'Some training',
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

    it('should disable the submit button to prevent it being triggered more than once', async () => {
      const { component, fixture, getByText, getByLabelText, trainingService, createSpy } = await setup(null);

      trainingService.setSelectedTrainingCategory({
        id: 2,
        seq: 20,
        category: 'Autism',
        trainingCategoryGroup: 'Specific conditions and disabilities',
      });
      component.ngOnInit();

      userEvent.type(getByLabelText('Training name'), 'Some training');
      userEvent.click(getByLabelText('No'));

      const submitButton = getByText('Save record') as HTMLButtonElement;
      userEvent.click(submitButton);
      fixture.detectChanges();

      expect(submitButton.disabled).toBe(true);
    });

    describe('upload certificate of an existing training', () => {
      const mockUploadFile = new File(['some file content'], 'First aid 2022.pdf', { type: 'application/pdf' });

      it('should call both `addCertificateToTraining` and `updateTrainingRecord` if an upload file is selected', async () => {
        const { component, fixture, getByText, getByLabelText, getByTestId, updateSpy, routerSpy, trainingService } =
          await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        const openNotesButton = getByText('Open notes');
        openNotesButton.click();
        fixture.detectChanges();

        const addCertificateToTrainingSpy = spyOn(trainingService, 'addCertificateToTraining').and.returnValue(
          of(null),
        );

        userEvent.type(getByLabelText('Add a note'), 'Some notes added to this training');
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
          [mockUploadFile],
        );

        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
      });

      it('should not call addCertificateToTraining if no file was selected', async () => {
        const { component, fixture, getByText, getByLabelText, trainingService } = await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        const openNotesButton = getByText('Open notes');
        openNotesButton.click();
        fixture.detectChanges();

        const addCertificateToTrainingSpy = spyOn(trainingService, 'addCertificateToTraining');

        userEvent.type(getByLabelText('Add a note'), 'Some notes added to this training');
        fireEvent.click(getByText('Save and return'));

        expect(addCertificateToTrainingSpy).not.toHaveBeenCalled();
      });
    });

    describe('add a new training record and upload certificate together', async () => {
      const mockUploadFile = new File(['some file content'], 'First aid 2022.pdf', { type: 'application/pdf' });

      it('should call both `addCertificateToTraining` and `createTrainingRecord` if an upload file is selected', async () => {
        const { component, fixture, getByText, getByLabelText, getByTestId, createSpy, routerSpy, trainingService } =
          await setup(null);

        component.previousUrl = ['/goToPreviousUrl'];
        component.trainingCategory = {
          category: 'Autism',
          id: 2,
        };

        fixture.detectChanges();

        const addCertificateToTrainingSpy = spyOn(trainingService, 'addCertificateToTraining').and.returnValue(
          of(null),
        );

        userEvent.type(getByLabelText('Training name'), 'Understanding Autism');
        userEvent.click(getByLabelText('Yes'));

        userEvent.upload(getByTestId('fileInput'), mockUploadFile);
        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(createSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
          trainingCategory: { id: 2 },
          title: 'Understanding Autism',
          accredited: 'Yes',
          completed: null,
          expires: null,
          notes: null,
        });

        expect(addCertificateToTrainingSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          trainingRecord.uid,
          [mockUploadFile],
        );

        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
      });

      it('should not call `addCertificateToTraining` when no upload file was selected', async () => {
        const { component, fixture, getByText, getByLabelText, createSpy, routerSpy, trainingService } = await setup(
          null,
        );

        component.previousUrl = ['/goToPreviousUrl'];
        component.trainingCategory = {
          category: 'Autism',
          id: 2,
        };
        const openNotesButton = getByText('Open notes');
        openNotesButton.click();
        fixture.detectChanges();

        const addCertificateToTrainingSpy = spyOn(trainingService, 'addCertificateToTraining');

        userEvent.type(getByLabelText('Add a note'), 'Some notes added to this training');
        fireEvent.click(getByText('Save record'));

        expect(createSpy).toHaveBeenCalled;

        expect(addCertificateToTrainingSpy).not.toHaveBeenCalled;

        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
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
      const veryLongString =
        'This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string.';

      it('should show an error message if the notes is over 1000 characters', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup(null);

        component.previousUrl = ['/goToPreviousUrl'];
        const openNotesButton = getByText('Open notes');
        openNotesButton.click();
        fixture.detectChanges();

        userEvent.type(getByLabelText('Add a note'), veryLongString);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Notes must be 1000 characters or fewer').length).toEqual(2);
      });

      it('should open the notes section if the notes input is over 1000 characters and section is closed on submit', async () => {
        const { fixture, getByText, getByLabelText, getByTestId } = await setup(null);

        const openNotesButton = getByText('Open notes');
        openNotesButton.click();
        fixture.detectChanges();

        userEvent.type(getByLabelText('Add a note'), veryLongString);

        const closeNotesButton = getByText('Close notes');
        closeNotesButton.click();
        fixture.detectChanges();

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        const notesSection = getByTestId('notesSection');

        expect(getByText('Close notes')).toBeTruthy();
        expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
      });
    });

    describe('uploadCertificate errors', () => {
      it('should show an error message if the selected file is over 500 KB', async () => {
        const { fixture, getByTestId, getByText } = await setup(null);

        const mockUploadFile = new File(['some file content'], 'large-file.pdf', { type: 'application/pdf' });

        Object.defineProperty(mockUploadFile, 'size', {
          value: 10 * 1024 * 1024, // 10MB
        });

        const fileInputButton = getByTestId('fileInput');

        userEvent.upload(fileInputButton, mockUploadFile);

        fixture.detectChanges();

        expect(getByText('The certificate must be no larger than 500KB')).toBeTruthy();
      });

      it('should show an error message if the selected file is not a pdf file', async () => {
        const { fixture, getByTestId, getByText } = await setup(null);

        const mockUploadFile = new File(['some file content'], 'non-pdf.png', { type: 'image/png' });

        const fileInputButton = getByTestId('fileInput');

        userEvent.upload(fileInputButton, [mockUploadFile]);

        fixture.detectChanges();

        expect(getByText('The certificate must be a PDF file')).toBeTruthy();
      });

      it('should clear the error message when user select a valid file instead', async () => {
        const { fixture, getByTestId, getByText, queryByText } = await setup(null);
        fixture.autoDetectChanges();

        const invalidFile = new File(['some file content'], 'non-pdf.png', { type: 'image/png' });
        const validFile = new File(['some file content'], 'certificate.pdf', { type: 'application/pdf' });

        const fileInputButton = getByTestId('fileInput');
        userEvent.upload(fileInputButton, [invalidFile]);
        expect(getByText('The certificate must be a PDF file')).toBeTruthy();

        userEvent.upload(fileInputButton, [validFile]);
        expect(queryByText('The certificate must be a PDF file')).toBeFalsy();
      });

      it('should provide aria description to screen reader users when error happen', async () => {
        const { fixture, getByTestId } = await setup(null);
        fixture.autoDetectChanges();

        const uploadSection = getByTestId('uploadCertificate');
        const fileInput = getByTestId('fileInput');

        userEvent.upload(fileInput, new File(['some file content'], 'non-pdf-file.csv'));

        const uploadButton = within(uploadSection).getByRole('button', {
          description: /Error: The certificate must be a PDF file/,
        });
        expect(uploadButton).toBeTruthy();
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

  describe('training certifications', () => {
    it('should show when there are training certifications', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.trainingCertificates = [
        {
          uid: '396ae33f-a99b-4035-9f29-718529a54244',
          filename: 'first_aid.pdf',
          uploadDate: '2024-04-12T14:44:29.151Z',
        },
      ];

      fixture.detectChanges();

      expect(getByTestId('trainingCertificatesTable')).toBeTruthy();
    });

    it('should not show when there are no training certifications', async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.trainingCertificates = [];

      fixture.detectChanges();

      expect(queryByTestId('trainingCertificatesTable')).toBeFalsy();
    });

    describe('Download buttons', () => {
      const mockTrainingCertificate = {
        uid: '396ae33f-a99b-4035-9f29-718529a54244',
        filename: 'first_aid.pdf',
        uploadDate: '2024-04-12T14:44:29.151Z',
      };

      const mockTrainingCertificate2 = {
        uid: '315ae33f-a99b-1235-9f29-718529a15044',
        filename: 'first_aid_advanced.pdf',
        uploadDate: '2024-04-13T16:44:21.121Z',
      };

      it('should show Download button when there is an existing training certificate', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.trainingCertificates = [mockTrainingCertificate];

        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const downloadButton = within(certificatesTable).getByText('Download');

        expect(downloadButton).toBeTruthy();
      });

      it('should make call to downloadCertificates with required uids and file uid in array when Download button clicked', async () => {
        const { component, fixture, getByTestId, trainingService } = await setup();

        const downloadCertificatesSpy = spyOn(trainingService, 'downloadCertificates').and.returnValue(
          of({ files: ['abc123'] }),
        );
        component.trainingCertificates = [mockTrainingCertificate];
        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const firstCertDownloadButton = within(certificatesTable).getAllByText('Download')[0];
        firstCertDownloadButton.click();

        expect(downloadCertificatesSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.trainingRecordId,
          [{ uid: mockTrainingCertificate.uid, filename: mockTrainingCertificate.filename }],
        );
      });

      it('should make call to downloadCertificates with all certificate file uids in array when Download all button clicked', async () => {
        const { component, fixture, getByTestId, trainingService } = await setup();

        const downloadCertificatesSpy = spyOn(trainingService, 'downloadCertificates').and.returnValue(
          of({ files: ['abc123'] }),
        );
        component.trainingCertificates = [mockTrainingCertificate, mockTrainingCertificate2];
        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const downloadButton = within(certificatesTable).getByText('Download all');
        downloadButton.click();

        expect(downloadCertificatesSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.trainingRecordId,
          [
            { uid: mockTrainingCertificate.uid, filename: mockTrainingCertificate.filename },
            { uid: mockTrainingCertificate2.uid, filename: mockTrainingCertificate2.filename },
          ],
        );
      });

      it('should display error message when Download fails', async () => {
        const { component, fixture, getByText, getByTestId, trainingService } = await setup();

        spyOn(trainingService, 'downloadCertificates').and.returnValue(throwError('403 forbidden'));
        component.trainingCertificates = [mockTrainingCertificate, mockTrainingCertificate2];

        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const downloadButton = within(certificatesTable).getAllByText('Download')[1];
        downloadButton.click();
        fixture.detectChanges();

        const expectedErrorMessage = getByText(
          "There's a problem with this download. Try again later or contact us for help.",
        );
        expect(expectedErrorMessage).toBeTruthy();
      });

      it('should display error message when Download all fails', async () => {
        const { component, fixture, getByText, getByTestId, trainingService } = await setup();

        spyOn(trainingService, 'downloadCertificates').and.returnValue(throwError('some download error'));
        component.trainingCertificates = [mockTrainingCertificate, mockTrainingCertificate2];

        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const downloadAllButton = within(certificatesTable).getByText('Download all');
        downloadAllButton.click();
        fixture.detectChanges();

        const expectedErrorMessage = getByText(
          "There's a problem with this download. Try again later or contact us for help.",
        );
        expect(expectedErrorMessage).toBeTruthy();
      });
    });

    describe('files to be uploaded', () => {
      const mockUploadFile1 = new File(['some file content'], 'First aid 2022.pdf', { type: 'application/pdf' });
      const mockUploadFile2 = new File(['some file content'], 'First aid 2024.pdf', { type: 'application/pdf' });

      it('should add a new upload file to the certification table when a file is selected', async () => {
        const { component, fixture, getByTestId } = await setup();
        fixture.autoDetectChanges();

        userEvent.upload(getByTestId('fileInput'), mockUploadFile1);

        const certificationTable = getByTestId('trainingCertificatesTable');

        expect(certificationTable).toBeTruthy();
        expect(within(certificationTable).getByText(mockUploadFile1.name)).toBeTruthy();
        expect(component.filesToUpload).toEqual([mockUploadFile1]);
      });

      it('should remove an upload file when its remove button is clicked', async () => {
        const { component, fixture, getByTestId, getByText } = await setup();
        fixture.autoDetectChanges();

        userEvent.upload(getByTestId('fileInput'), mockUploadFile1);
        userEvent.upload(getByTestId('fileInput'), mockUploadFile2);

        const certificationTable = getByTestId('trainingCertificatesTable');
        expect(within(certificationTable).getByText(mockUploadFile1.name)).toBeTruthy();
        expect(within(certificationTable).getByText(mockUploadFile2.name)).toBeTruthy();

        const rowForFile2 = getByText(mockUploadFile2.name).parentElement;
        const removeButtonForFile2 = within(rowForFile2).getByText('Remove');

        userEvent.click(removeButtonForFile2);

        expect(within(certificationTable).queryByText(mockUploadFile2.name)).toBeFalsy();

        expect(within(certificationTable).queryByText(mockUploadFile1.name)).toBeTruthy();
        expect(component.filesToUpload).toHaveSize(1);
        expect(component.filesToUpload[0]).toEqual(mockUploadFile1);
      });
    });

    describe('saved files to be removed', () => {
      it('should remove a file from the table when the remove button is clicked', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.trainingCertificates = [
          {
            uid: 'uid-1',
            filename: 'first_aid_v1.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-2',
            filename: 'first_aid_v2.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-3',
            filename: 'first_aid_v3.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
        ];

        fixture.detectChanges();

        const certificateRow2 = getByTestId('certificate-row-2');

        const removeButtonForRow2 = within(certificateRow2).getByText('Remove');

        fireEvent.click(removeButtonForRow2);

        fixture.detectChanges();

        expect(component.trainingCertificates.length).toBe(2);
      });

      it('should remove all file from the table when the remove button is clicked for all saved files', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.trainingCertificates = [
          {
            uid: 'uid-1',
            filename: 'first_aid_v1.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-2',
            filename: 'first_aid_v2.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-3',
            filename: 'first_aid_v3.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
        ];

        fixture.detectChanges();

        const certificateRow0 = getByTestId('certificate-row-0');
        const certificateRow1 = getByTestId('certificate-row-1');
        const certificateRow2 = getByTestId('certificate-row-2');

        const removeButtonForRow0 = within(certificateRow0).getByText('Remove');
        const removeButtonForRow1 = within(certificateRow1).getByText('Remove');
        const removeButtonForRow2 = within(certificateRow2).getByText('Remove');

        fireEvent.click(removeButtonForRow0);
        fireEvent.click(removeButtonForRow1);
        fireEvent.click(removeButtonForRow2);

        fixture.detectChanges();
        expect(component.trainingCertificates.length).toBe(0);
      });

      it('should call the training service when save and return is clicked', async () => {
        const { component, fixture, getByTestId, getByText, trainingService } = await setup();

        component.trainingCertificates = [
          {
            uid: 'uid-1',
            filename: 'first_aid_v1.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-2',
            filename: 'first_aid_v2.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
        ];

        fixture.detectChanges();

        const certificateRow = getByTestId('certificate-row-0');

        const removeButtonForRow = within(certificateRow).getByText('Remove');
        const trainingServiceSpy = spyOn(trainingService, 'deleteCertificates').and.callThrough();
        fireEvent.click(removeButtonForRow);
        fireEvent.click(getByText('Save and return'));

        fixture.detectChanges();

        expect(trainingServiceSpy).toHaveBeenCalledWith(
          component.establishmentUid,
          component.workerId,
          component.trainingRecordId,
          component.filesToRemove,
        );
      });

      it('should not call the training service when save and return is clicked and there are no files to remove ', async () => {
        const { component, fixture, getByText, trainingService } = await setup();

        component.trainingCertificates = [];

        fixture.detectChanges();

        const trainingServiceSpy = spyOn(trainingService, 'deleteCertificates').and.callThrough();

        fireEvent.click(getByText('Save and return'));

        fixture.detectChanges();

        expect(trainingServiceSpy).not.toHaveBeenCalled();
      });
    });
  });
});
