import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import {
  MockTrainingServiceWithOverrides,
  MockTrainingServiceWithPreselectedStaff,
} from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { ConfirmMultipleTrainingComponent } from './confirm-multiple-training.component';

describe('ConfirmMultipleTrainingComponent', () => {
  const selectedTraining = {
    accredited: 'Yes',
    trainingCategory: { id: 1, seq: 3, category: 'Category' },
    completed: '2020-01-01',
    notes: 'This is a note',
    title: 'Title',
    howWasItDelivered: 'External',
    externalProviderName: 'Care Skills Academy',
    deliveredBy: 'Face to face',
  };
  async function setup(overrides: any = { incompleteTraining: false, isPrimaryWorkplace: true }) {
    const setupTools = await render(ConfirmMultipleTrainingComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, AddMultipleTrainingModule],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                establishment: {
                  uid: overrides.isPrimaryWorkplace ? '98a83eef-e1e1-49f3-89c5-b1287a3cc8de' : 'mock-uid',
                },
              },
            },
          }),
        },

        {
          provide: TrainingService,
          useFactory: overrides?.selectedTraining
            ? MockTrainingServiceWithOverrides.factory(overrides.selectedTraining)
            : MockTrainingServiceWithPreselectedStaff.factory(overrides.incompleteTraining),
          deps: [HttpClient],
        },
        { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
      ],
    });

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
      component: setupTools.fixture.componentInstance,
      ...setupTools,
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

  it('should show the caption and heading', async () => {
    const { getByRole, getByTestId } = await setup();

    const caption = getByTestId('section-heading');

    expect(caption.textContent).toBe('Add multiple training records');
    expect(getByRole('heading', { name: 'Summary' })).toBeTruthy();
  });

  it('should display the "Save training records" button', async () => {
    const { getByText } = await setup();
    expect(getByText('Save training records')).toBeTruthy();
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
        '/workplace/98a83eef-e1e1-49f3-89c5-b1287a3cc8de/add-multiple-training/confirm-training/select-staff',
      );
    });
  });

  describe('Training record details', () => {
    it('should display the training record information', async () => {
      const overrides = {
        selectedTraining: {
          selectedTraining: {
            ...selectedTraining,
            howWasItDelivered: 'External',
            externalProviderName: 'Care Skills Academy',
            deliveredBy: 'Face to face',
            validityPeriodInMonth: 12,
          },
        },
      };
      const { getByTestId } = await setup(overrides);

      const trainingRecordDetails = getByTestId('trainingRecordDetails');

      expect(within(trainingRecordDetails).getByText('Category')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Title')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Yes')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('1 January 2020')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('This is a note')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('External')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Care Skills Academy')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Face to face')).toBeTruthy();
    });

    it('should display a `-` if there are no dates and `No notes added` if there are no notes', async () => {
      const { getByTestId } = await setup({ incompleteTraining: true });

      const trainingRecordDetails = getByTestId('trainingRecordDetails');

      expect(within(trainingRecordDetails).queryAllByText('-').length).toEqual(4);
      expect(within(trainingRecordDetails).getByText('No notes added')).toBeTruthy();
    });

    describe('validity', () => {
      it('should show the non plurarised amount', async () => {
        const overrides = {
          selectedTraining: {
            selectedTraining: {
              ...selectedTraining,
              howWasItDelivered: 'External',
              externalProviderName: 'Care Skills Academy',
              deliveredBy: 'Face to face',
              validityPeriodInMonth: 1,
            },
          },
        };
        const { getByTestId } = await setup(overrides);

        const trainingRecordDetails = getByTestId('trainingRecordDetails');

        expect(within(trainingRecordDetails).getByText('1 month')).toBeTruthy();
      });

      it('should show the plurarised amount', async () => {
        const overrides = {
          selectedTraining: { selectedTraining: { ...selectedTraining, validityPeriodInMonth: 12 } },
        };
        const { getByTestId } = await setup(overrides);

        const trainingRecordDetails = getByTestId('trainingRecordDetails');

        expect(within(trainingRecordDetails).getByText('12 months')).toBeTruthy();
      });

      it('should show it does not expire', async () => {
        const overrides = {
          selectedTraining: {
            selectedTraining: { ...selectedTraining, validityPeriodInMonth: null, doesNotExpire: true },
          },
        };
        const { getByTestId } = await setup(overrides);

        const trainingRecordDetails = getByTestId('trainingRecordDetails');

        expect(within(trainingRecordDetails).getByText('Does not expire')).toBeTruthy();
      });
    });

    it('should display a change link with the correct href at Training category row which navigates to select training category page', async () => {
      const { getByTestId } = await setup();

      const trainingRecordDetails = getByTestId('trainingRecordDetails');
      const trainingCategoryRow = within(trainingRecordDetails).getByText('Training category').parentElement;
      const changeLink = within(trainingCategoryRow).getByText('Change');

      expect(changeLink.getAttribute('href')).toEqual(
        '/workplace/98a83eef-e1e1-49f3-89c5-b1287a3cc8de/add-multiple-training/confirm-training/select-training-category',
      );
    });

    it('should display a change link with the correct href at Training record name row which navigates to training detail page', async () => {
      const { getByTestId } = await setup();

      const trainingRecordDetails = getByTestId('trainingRecordDetails');
      const trainingNameRow = within(trainingRecordDetails).getByText('Training record name').parentElement;
      const changeLink = within(trainingNameRow).getByText('Change');

      expect(changeLink.getAttribute('href')).toEqual(
        '/workplace/98a83eef-e1e1-49f3-89c5-b1287a3cc8de/add-multiple-training/confirm-training/training-details',
      );
    });
  });

  describe('Confirming details', () => {
    it('should call createMultipleTrainingRecords function when clicking Save training records button', async () => {
      const { component, fixture, getByText, workerSpy } = await setup();

      const selectedTraining = component['trainingService'].selectedTraining;
      const selectedStaff = component.workers.map((worker) => worker.uid);

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(workerSpy).toHaveBeenCalledWith('98a83eef-e1e1-49f3-89c5-b1287a3cc8de', selectedStaff, selectedTraining);
    });

    it('should call resetState in the training service when successfully confirming details', async () => {
      const { getByText, fixture, trainingSpy } = await setup();

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(trainingSpy).toHaveBeenCalled();
    });

    it('should navigate back to the dashboard and add an alert when it is the primary workplace', async () => {
      const { fixture, getByText, routerSpy, alertSpy } = await setup();

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: '2 training records added',
      } as Alert);
    });
  });
});
