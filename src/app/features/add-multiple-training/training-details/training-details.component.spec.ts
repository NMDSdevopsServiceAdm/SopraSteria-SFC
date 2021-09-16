import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { MultipleTrainingDetailsComponent } from './training-details.component';

describe('MultipleTrainingDetailsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(MultipleTrainingDetailsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMultipleTrainingModule],
      providers: [
        AlertService,
        WindowRef,
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              params: { trainingRecordId: '1' },
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
        { provide: TrainingService, useClass: MockTrainingServiceWithPreselectedStaff },
        { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const alert = injector.inject(AlertService) as AlertService;

    const alertSpy = spyOn(alert, 'addAlert');
    alertSpy.and.callThrough();

    const workerService = injector.inject(WorkerService) as WorkerService;

    const workerSpy = spyOn(workerService, 'createMultipleTrainingRecords');
    workerSpy.and.callThrough();

    const trainingService = injector.inject(TrainingService) as TrainingService;

    const trainingSpy = spyOn(trainingService, 'resetSelectedStaff');
    trainingSpy.and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      spy,
      alertSpy,
      workerSpy,
      trainingSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the correct title', async () => {
    const { getByText } = await setup();
    expect(getByText('Add training details')).toBeTruthy();
  });

  it('should show the Finish button', async () => {
    const { getByText } = await setup();
    expect(getByText('Finish')).toBeTruthy();
  });

  it('should show a dropdown with the correct categories in', async () => {
    const { component } = await setup();
    expect(component.categories).toEqual([
      { id: 1, seq: 10, category: 'Activity provision/Well-being' },
      { id: 2, seq: 20, category: 'Autism' },
    ]);
  });

  it('should show a how many staff are selected', async () => {
    const { getByText } = await setup();
    expect(getByText('Number of staff selected:', { exact: false })).toBeTruthy();
  });

  it('should have the correct number of staff selected', async () => {
    const { component } = await setup();
    expect(component.workerCount).toEqual(1);
  });

  it('should submit, navigate and add alert when complete', async () => {
    const { component, getByText, fixture, spy, alertSpy, workerSpy, trainingSpy } = await setup();
    component.form.markAsDirty();
    component.form.get('category').setValue('1');
    component.form.get('category').markAsDirty();

    const finishButton = getByText('Finish');
    fireEvent.click(finishButton);
    fixture.detectChanges();

    expect(component.form.valid).toBeTruthy();
    expect(trainingSpy).toHaveBeenCalled();
    expect(workerSpy).toHaveBeenCalledWith('1', ['1234'], {
      trainingCategory: { id: 1 },
      title: null,
      accredited: null,
      completed: null,
      expires: null,
      notes: null,
    });
    expect(spy).toHaveBeenCalledWith(['workplace', '1'], { fragment: 'training-and-qualifications' });

    await fixture.whenStable();
    expect(alertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: `Training records have been added for 1 staff`,
    } as Alert);
  });

  describe('errors', () => {
    it('should show an error when no training category selected', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('category').setValue(null);
      component.form.get('category').markAsDirty();
      const finishButton = getByText('Finish');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText('Select a training category').length).toEqual(3);
    });

    it('should show an error when training name less than 3 characters', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('title').setValue('a');
      component.form.get('title').markAsDirty();
      const finishButton = getByText('Finish');
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
      const finishButton = getByText('Finish');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Training name must be between 3 and 120 characters').length).toEqual(2);
    });

    it('should show an error when completed date not valid', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('completed').setValue({ day: 32, month: 12, year: 2000 });
      component.form.get('completed').markAsDirty();
      const finishButton = getByText('Finish');
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
      const finishButton = getByText('Finish');
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
      const finishButton = getByText('Finish');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Date completed cannot be more than 100 years ago').length).toEqual(2);
    });

    it('should show an error when expiry date not valid', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('expires').setValue({ day: 32, month: 12, year: 2000 });
      component.form.get('expires').markAsDirty();
      const finishButton = getByText('Finish');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Expiry date must be a valid date').length).toEqual(2);
    });

    it('should show an error when expiry date is more than 100 years ago', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      const today = new Date();
      const todayDate = { day: 31, month: 12, year: today.getFullYear() - 101 };
      component.form.get('expires').setValue(todayDate);
      component.form.get('expires').markAsDirty();
      const finishButton = getByText('Finish');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Expiry date cannot be more than 100 years ago').length).toEqual(2);
    });
  });
});
