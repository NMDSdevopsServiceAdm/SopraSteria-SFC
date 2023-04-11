import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingService, MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { MultipleTrainingDetailsComponent } from './training-details.component';

describe('MultipleTrainingDetailsComponent', () => {
  async function setup(
    accessedFromSummary = false,
    prefill = false,
    isPrimaryWorkplace = true,
    qsParamGetMock = sinon.fake(),
  ) {
    const { fixture, getByText, getAllByText, getByTestId, getByLabelText } = await render(
      MultipleTrainingDetailsComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMultipleTrainingModule],
        providers: [
          WindowRef,
          { provide: EstablishmentService, useClass: MockEstablishmentService },
          {
            provide: ActivatedRoute,
            useValue: new MockActivatedRoute({
              snapshot: {
                params: { trainingRecordId: '1' },
                parent: {
                  url: [{ path: accessedFromSummary ? 'confirm-training' : 'add-multiple-training' }],
                },
                queryParamMap: {
                  get: qsParamGetMock,
                },
              },
              parent: {
                snapshot: {
                  data: {
                    establishment: {
                      uid: isPrimaryWorkplace ? '98a83eef-e1e1-49f3-89c5-b1287a3cc8de' : 'mock-uid',
                    },
                  },
                },
              },
            }),
          },
          FormBuilder,
          ErrorSummaryService,
          {
            provide: TrainingService,
            useClass: prefill ? MockTrainingServiceWithPreselectedStaff : MockTrainingService,
          },
          { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const trainingService = injector.inject(TrainingService) as TrainingService;

    const spy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerSpy = spyOn(workerService, 'createMultipleTrainingRecords').and.callThrough();
    const trainingSpy = spyOn(trainingService, 'resetState').and.callThrough();
    const updateSelectedTrainingSpy = spyOn(trainingService, 'updateSelectedTraining');

    return {
      component,
      fixture,
      getByText,
      getByLabelText,
      getAllByText,
      getByTestId,
      spy,
      workerSpy,
      trainingService,
      trainingSpy,
      updateSelectedTrainingSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render `Continue` and `Cancel` buttons when it is not accessed from the confirm training page', async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should render `Save and return` and `Cancel` buttons when it is accessed from the confirm training page', async () => {
    const { getByText } = await setup(true);

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should show a dropdown with the correct categories in', async () => {
    const { component } = await setup();
    expect(component.categories).toEqual([
      { id: 1, seq: 10, category: 'Activity provision/Well-being' },
      { id: 2, seq: 20, category: 'Autism' },
    ]);
  });

  it('should store the selected training in training service and navigate to the next page when filling out the form and clicking continue', async () => {
    const { component, getByText, getByLabelText, getByTestId, fixture, updateSelectedTrainingSpy, spy } =
      await setup();

    const categoryOption = component.categories[0].id.toString();

    userEvent.selectOptions(getByLabelText('Training category'), categoryOption);
    userEvent.type(getByLabelText('Training name'), 'Training');
    userEvent.click(getByLabelText('Yes'));
    const completedDate = getByTestId('completedDate');
    userEvent.type(within(completedDate).getByLabelText('Day'), '1');
    userEvent.type(within(completedDate).getByLabelText('Month'), '1');
    userEvent.type(within(completedDate).getByLabelText('Year'), '2020');
    const expiryDate = getByTestId('expiresDate');
    userEvent.type(within(expiryDate).getByLabelText('Day'), '1');
    userEvent.type(within(expiryDate).getByLabelText('Month'), '1');
    userEvent.type(within(expiryDate).getByLabelText('Year'), '2022');
    userEvent.type(getByLabelText('Notes'), 'Notes for training');

    const finishButton = getByText('Continue');
    userEvent.click(finishButton);
    fixture.detectChanges();

    expect(component.form.valid).toBeTruthy();
    expect(updateSelectedTrainingSpy).toHaveBeenCalledWith({
      trainingCategory: component.categories[0],
      title: 'Training',
      accredited: 'Yes',
      completed: '2020-01-01',
      expires: '2022-01-01',
      notes: 'Notes for training',
    });
    expect(spy).toHaveBeenCalledWith([
      'workplace',
      component.workplace.uid,
      'add-multiple-training',
      'confirm-training',
    ]);
  });

  it('should navigate to the confirm training page when page has been accessed from that page and pressing Save and return', async () => {
    const { component, fixture, getByText, updateSelectedTrainingSpy, spy } = await setup(true, true);

    const button = getByText('Save and return');
    fireEvent.click(button);
    fixture.detectChanges();

    expect(updateSelectedTrainingSpy).toHaveBeenCalledWith({
      trainingCategory: component.categories[0],
      title: 'Title',
      accredited: 'Yes',
      completed: '2020-01-01',
      expires: '2021-01-01',
      notes: 'This is a note',
    });
    expect(spy).toHaveBeenCalledWith([
      'workplace',
      component.workplace.uid,
      'add-multiple-training',
      'confirm-training',
    ]);
  });

  it('should reset training service state and navigate to dashboard when pressing cancel when in the flow and primary user', async () => {
    const { getByText, spy, trainingSpy } = await setup();

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(trainingSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });

  it('should reset training service state and navigate to sub workplace home page åwhen pressing cancel when in the flow but not the primary user', async () => {
    const { getByText, spy, trainingSpy } = await setup(false, false, false);

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(trainingSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['workplace', 'mock-uid'], { fragment: 'training-and-qualifications' });
  });

  it('should not clear selected staff and navigate when pressing cancel when in the flow', async () => {
    const { getByText, spy, trainingSpy } = await setup(true);

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(trainingSpy).not.toHaveBeenCalled();
    expect(spy.calls.mostRecent().args[0]).toEqual(['../']);
  });

  it('should prefill the form if it has already been filled out', async () => {
    const { component } = await setup(false, true);

    const form = component.form;
    const { trainingCategory, title, accredited, completed, expires, notes } =
      component.trainingService.selectedTraining;
    const completedArr = completed.split('-');
    const expiresArr = expires.split('-');

    expect(form.value).toEqual({
      category: trainingCategory.id,
      title,
      accredited,
      completed: { day: +completedArr[2], month: +completedArr[1], year: +completedArr[0] },
      expires: { day: +expiresArr[2], month: +expiresArr[1], year: +expiresArr[0] },
      notes,
    });
  });

  describe('errors', () => {
    it('should show an error when no training category selected', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('category').setValue(null);
      component.form.get('category').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText('Select the training category').length).toEqual(3);
    });

    it('should show an error when training name less than 3 characters', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('title').setValue('a');
      component.form.get('title').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Training name must be between 3 and 120 characters').length).toEqual(2);
    });

    it('should show an error when training name more than 120 characters', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form
        .get('title')
        .setValue(
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        );
      component.form.get('title').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Training name must be between 3 and 120 characters').length).toEqual(2);
    });

    it('should show an error when completed date not valid', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('completed').setValue({ day: 32, month: 12, year: 2000 });
      component.form.get('completed').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Date completed must be a valid date').length).toEqual(2);
    });

    it('should show an error when completed date is after today', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      const today = new Date();
      const todayDate = { day: 31, month: 12, year: today.getFullYear() + 1 };
      component.form.get('completed').setValue(todayDate);
      component.form.get('completed').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Date completed must be before today').length).toEqual(2);
    });

    it('should show an error when completed date is more than 100 years ago', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      const today = new Date();
      const todayDate = { day: 31, month: 12, year: today.getFullYear() - 101 };
      component.form.get('completed').setValue(todayDate);
      component.form.get('completed').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Date completed cannot be more than 100 years ago').length).toEqual(2);
    });

    it('should show an error when expiry date not valid', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('expires').setValue({ day: 32, month: 12, year: 2000 });
      component.form.get('expires').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Expiry date must be a valid date').length).toEqual(2);
    });

    it('should show an error when expiry date not valid and 0s are entered in the input fields', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('expires').setValue({ day: 0, month: 0, year: 0 });
      component.form.get('expires').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Expiry date must be a valid date').length).toEqual(2);
    });

    it('should show an error when expiry date is before the completed date', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      const today = new Date();
      const completedDate = { day: 7, month: today.getMonth(), year: today.getFullYear() };
      const expiresDate = { day: 6, month: today.getMonth(), year: today.getFullYear() };
      component.form.get('completed').setValue(completedDate);
      component.form.get('completed').markAsDirty();
      component.form.get('expires').setValue(expiresDate);
      component.form.get('expires').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Expiry date must be after date completed').length).toEqual(2);
    });

    it('should show an error when notes input length is more than 1000 characters', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form
        .get('notes')
        .setValue(
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        );
      component.form.get('notes').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Notes must be 1000 characters or fewer').length).toEqual(2);
    });
  });
});
