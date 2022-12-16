import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { ConfirmMultipleTrainingComponent } from './confirm-multiple-training.component';

describe('MultipleTrainingDetailsComponent', () => {
  async function setup(incompleteTraining = false) {
    const { fixture, getByText, getAllByText, getByTestId, getByLabelText } = await render(
      ConfirmMultipleTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMultipleTrainingModule],
        providers: [
          AlertService,
          WindowRef,
          {
            provide: ActivatedRoute,
            useValue: new MockActivatedRoute({
              snapshot: {
                data: {
                  establishment: {
                    uid: 'mock-uid',
                  },
                },
              },
            }),
          },

          {
            provide: TrainingService,
            useFactory: MockTrainingServiceWithPreselectedStaff.factory(incompleteTraining),
            deps: [HttpClient],
          },
          { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const alert = injector.inject(AlertService) as AlertService;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const trainingService = injector.inject(TrainingService) as TrainingService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const alertSpy = spyOn(alert, 'addAlert').and.callThrough();
    const workerSpy = spyOn(workerService, 'createMultipleTrainingRecords').and.callThrough();
    const trainingSpy = spyOn(trainingService, 'resetState').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getByLabelText,
      getAllByText,
      getByTestId,
      routerSpy,
      alertSpy,
      workerSpy,
      trainingService,
      trainingSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the confirm button', async () => {
    const { getByText } = await setup();
    expect(getByText('Confirm details')).toBeTruthy();
  });

  describe('Selected staff summary', () => {
    it('should display a list of staff for the mandatory training to be added to', async () => {
      const { component, getByTestId } = await setup();

      const selectedStaffSummary = getByTestId('selectedStaffSummary');
      const selectedStaff = component.workers;

      selectedStaff.forEach((staff) => {
        expect(within(selectedStaffSummary).getByText(staff.nameOrId)).toBeTruthy();
        expect(within(selectedStaffSummary).getByText(staff.mainJob.title)).toBeTruthy();
      });
    });

    it('should display a change link with the correct href', async () => {
      const { getByTestId } = await setup();

      const selectedStaffSummary = getByTestId('selectedStaffSummary');
      const changeLink = within(selectedStaffSummary).getByText('Change');

      expect(changeLink.getAttribute('href')).toEqual(
        '/workplace/mock-uid/add-multiple-training/confirm-training/select-staff',
      );
    });
  });

  describe('Training record details', () => {
    it('should display the training record information', async () => {
      const { getByTestId } = await setup();

      const trainingRecordDetails = getByTestId('trainingRecordDetails');

      expect(within(trainingRecordDetails).getByText('Category')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Title')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Yes')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('1 January 2020')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('1 January 2021')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('This is a note')).toBeTruthy();
    });

    it('should display a `-` if there are no dates and `No notes added` if there are no notes', async () => {
      const { getByTestId } = await setup(true);

      const trainingRecordDetails = getByTestId('trainingRecordDetails');

      expect(within(trainingRecordDetails).queryAllByText('-').length).toEqual(2);
      expect(within(trainingRecordDetails).getByText('No notes added')).toBeTruthy();
    });

    it('should display a change link with the correct href', async () => {
      const { getByTestId } = await setup();

      const trainingRecordDetails = getByTestId('trainingRecordDetails');
      const changeLink = within(trainingRecordDetails).getByText('Change');

      expect(changeLink.getAttribute('href')).toEqual(
        '/workplace/mock-uid/add-multiple-training/confirm-training/training-details',
      );
    });
  });

  describe('Confirming details', () => {
    it('should call createMultipleTrainingRecords function when clicking confirm details button', async () => {
      const { component, fixture, getByText, workerSpy } = await setup();

      const selectedTraining = component['trainingService'].selectedTraining;
      const selectedStaff = component.workers.map((worker) => worker.uid);

      const button = getByText('Confirm details');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(workerSpy).toHaveBeenCalledWith('mock-uid', selectedStaff, selectedTraining);
    });

    it('should call resetState in the training service when successfully confirming details', async () => {
      const { getByText, fixture, trainingSpy } = await setup();

      const button = getByText('Confirm details');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(trainingSpy).toHaveBeenCalled();
    });

    it('should navigate back to the training and qualifications tab and add an alert', async () => {
      const { fixture, getByText, routerSpy, alertSpy } = await setup();

      const button = getByText('Confirm details');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'training-and-qualifications' });
      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: '2 training records added',
      } as Alert);
    });
  });
});
