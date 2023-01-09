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
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { AddEditTrainingComponent } from './add-edit-training.component';

describe('AddEditTrainingComponent', () => {
  async function setup(isMandatory = false, trainingRecordId = '1') {
    if (isMandatory) {
      window.history.pushState({ training: 'mandatory', missingRecord: { category: 'testCategory', id: 5 } }, '');
    }

    const { fixture, getByText, getByTestId, queryByText, queryByTestId, getByLabelText } = await render(
      AddEditTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          AlertService,
          WindowRef,
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

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      routerSpy,
      getByText,
      getByTestId,
      queryByText,
      queryByTestId,
      getByLabelText,
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
    // it('should display the missing mandatory training category as text when a manadatoryTraining object is passed', async () => {
    //   const { getByText } = await setup(true);

    //   expect(getByText('Training category: testCategory')).toBeTruthy();
    // });

    // it('should display the missing mandatory training category as text when a manadatoryTraining object is passed', async () => {
    //   const { queryByTestId } = await setup(true);

    //   expect(queryByTestId('trainingSelect')).toBeFalsy();
    // });

    // it('should have dropdown of training categories when a manadatoryTraining object is not passed', async () => {
    //   const { getByTestId } = await setup();

    //   expect(getByTestId('trainingSelect')).toBeTruthy();
    // });

    it('should show the training category select box when there is no training category id present', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.trainingCategoryId = null;
      fixture.detectChanges();

      expect(getByTestId('trainingSelect')).toBeTruthy();
      expect(queryByTestId('trainingCategoryDisplay')).toBeFalsy();
    });

    it('should show the training category displayed as text when there is a training category id', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId } = await setup();

      component.trainingCategoryId = '1';
      fixture.detectChanges();

      const trainingCategory = component.trainingRecord.trainingCategory.category;

      expect(getByTestId('trainingCategoryDisplay')).toBeTruthy();
      expect(queryByTestId('trainingSelect')).toBeFalsy();
      expect(getByText(trainingCategory)).toBeTruthy();
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
        accredited: true,
        completed: { day: 2, month: '1', year: 2020 },
        expires: { day: 2, month: '1', year: 2021 },
        notes: undefined,
      };

      expect(form.value).toEqual(expectedFormValue);
      expect(workerServiceSpy).toHaveBeenCalledWith(workplace.uid, worker.uid, trainingRecordId);
    });

    it('should not prefill the form if there is a training record id but there is no training record', async () => {
      const { component, workerService } = await setup();
      spyOn(workerService, 'getTrainingRecord').and.returnValue(of({}));
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

  describe('delete button', () => {
    it('should render the delete button when editing training', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('deleteButton')).toBeTruthy();
    });

    it('should not render the delete button when there is no training id', async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.trainingRecordId = null;
      fixture.detectChanges();

      expect(queryByTestId('deleteButton')).toBeFalsy();
    });
  });

  describe('Cancel button', () => {
    it('should call navigateByUrl when pressing cancel', async () => {
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
      const { component, fixture, getByText, getByLabelText, workerService, routerSpy } = await setup();

      component.previousUrl = ['/goToPreviousUrl'];
      fixture.detectChanges();
      const spy = spyOn(workerService, 'updateTrainingRecord').and.callThrough();
      userEvent.type(getByLabelText('Notes'), 'Some notes added to this training');
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const expectedFormValue = {
        title: 'Communication Training 1',
        category: 1,
        accredited: true,
        completed: { day: 2, month: '1', year: 2020 },
        expires: { day: 2, month: '1', year: 2021 },
        notes: 'Some notes added to this training',
      };

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual(expectedFormValue);
      expect(spy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, component.trainingRecordId, {
        trainingCategory: { id: 1 },
        title: 'Communication Training 1',
        accredited: true,
        completed: '2020-01-02',
        expires: '2021-01-02',
        notes: 'Some notes added to this training',
      });
      expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
    });
  });

  xit('should call the createTrainingRecord function if adding a new training record, and navigate away from page', async () => {
    const { component, fixture, getByText, getByLabelText, workerService, routerSpy } = await setup(false, null);

    component.previousUrl = ['/goToPreviousUrl'];
    fixture.detectChanges();
    const spy = spyOn(workerService, 'updateTrainingRecord').and.callThrough();
    userEvent.type(getByLabelText('Notes'), 'Some notes added to this training');
    fireEvent.click(getByText('Save and return'));
    fixture.detectChanges();

    const expectedFormValue = {
      title: 'Communication Training 1',
      category: 1,
      accredited: true,
      completed: { day: 2, month: '1', year: 2020 },
      expires: { day: 2, month: '1', year: 2021 },
      notes: 'Some notes added to this training',
    };

    const updatedFormData = component.form.value;
    expect(updatedFormData).toEqual(expectedFormValue);
    expect(spy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, component.trainingRecordId, {
      trainingCategory: { id: 1 },
      title: 'Communication Training 1',
      accredited: true,
      completed: '2020-01-02',
      expires: '2021-01-02',
      notes: 'Some notes added to this training',
    });
    expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
  });
});
