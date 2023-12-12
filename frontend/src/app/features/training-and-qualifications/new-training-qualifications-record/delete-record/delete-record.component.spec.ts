import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerService, qualificationRecord, trainingRecord } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { WorkersModule } from '../../../workers/workers.module';
import { DeleteRecordComponent } from './delete-record.component';

describe('DeleteRecordComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  async function setup(trainingView = true, otherJob = false) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(DeleteRecordComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: workplace,
                worker: {
                  uid: 123,
                  nameOrId: 'John',
                  mainJob: {
                    title: 'Care Worker',
                    other: otherJob ? 'Care taker' : undefined,
                  },
                },
                trainingRecord: trainingView ? trainingRecord : null,
                qualificationRecord: trainingView ? null : qualificationRecord,
              },
            },
          },
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService) as WorkerService;
    const workerTrainingSpy = spyOn(workerService, 'deleteTrainingRecord');
    workerTrainingSpy.and.returnValue(of({}));

    const workerQualificationSpy = spyOn(workerService, 'deleteQualification');
    workerQualificationSpy.and.returnValue(of({}));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert');

    return {
      component,
      fixture,
      routerSpy,
      workerTrainingSpy,
      workerQualificationSpy,
      alertSpy,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
    };
  }

  it('should render a TrainingAndQualificationsRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the worker name', async () => {
    const { component, getByTestId } = await setup();

    expect(getByTestId('workerNameAndRole').textContent).toContain(component.worker.nameOrId);
  });

  describe('Training', () => {
    it('should display the correct title', async () => {
      const { getByText } = await setup();

      expect(getByText(`You're about to delete this training record`)).toBeTruthy();
    });

    it('should navigate to the edit training page when pressing cancel if in training view', async () => {
      const { component, getByText, routerSpy } = await setup();

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith([
        `workplace/${component.workplace.uid}/training-and-qualifications-record/${component.worker.uid}`,
        'training',
        component.trainingRecord.uid,
      ]);
    });

    describe('Summary table', () => {
      it('should display the worker name or ID number', async () => {
        const { component, getByTestId } = await setup();

        expect(getByTestId('workerName').textContent).toContain(component.worker.nameOrId);
      });

      it('should display the training category', async () => {
        const { component, getByTestId } = await setup();

        expect(getByTestId('trainingCategory').textContent).toContain(
          component.trainingRecord.trainingCategory.category,
        );
      });

      it('should display the training name', async () => {
        const { component, getByTestId } = await setup();

        expect(getByTestId('trainingName').textContent).toContain(component.trainingRecord.title);
      });
    });

    describe('Delete button', () => {
      it('should display the delete button', async () => {
        const { getByText } = await setup();

        expect(getByText('Delete record')).toBeTruthy();
      });

      it('should call the deleteTrainingRecord function when pressing the delete button', async () => {
        const { component, getByText, workerTrainingSpy } = await setup();

        const deleteButton = getByText('Delete record');
        fireEvent.click(deleteButton);

        expect(workerTrainingSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.trainingRecord.uid,
        );
      });

      it('should navigate to the view training page when pressing the delete button and set an alert message in thw history state', async () => {
        const { component, fixture, getByText, routerSpy } = await setup();
        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const deleteButton = getByText('Delete record');
        fireEvent.click(deleteButton);
        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl'], {
          state: { alertMessage: 'Training record deleted' },
        });
      });
    });
  });

  describe('Qualification', () => {
    it('should display the correct title', async () => {
      const { getByText } = await setup(false);

      expect(getByText(`You're about to delete this qualification record`)).toBeTruthy();
    });

    it('should navigate to the edit qualification page when pressing cancel if in qualifications view', async () => {
      const { component, getByText, routerSpy } = await setup(false);

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith([
        `workplace/${component.workplace.uid}/training-and-qualifications-record/${component.worker.uid}`,
        'qualification',
        component.qualificationRecord.uid,
      ]);
    });

    describe('Summary table', () => {
      it('should display the worker name or ID number', async () => {
        const { component, getByTestId } = await setup(false);

        expect(getByTestId('workerName').textContent).toContain(component.worker.nameOrId);
      });

      it('should display the type of qualification', async () => {
        const { component, getByTestId } = await setup(false);

        expect(getByTestId('qualificationType').textContent).toContain(
          component.qualificationRecord.qualification.group,
        );
      });

      it('should display the qualification name', async () => {
        const { component, getByTestId } = await setup(false);

        expect(getByTestId('qualificationName').textContent).toContain(
          component.qualificationRecord.qualification.title,
        );
      });
    });

    describe('Delete button', () => {
      it('should display the delete button', async () => {
        const { getByText } = await setup(false);

        expect(getByText('Delete record')).toBeTruthy();
      });

      it('should call the deleteQualificationRecord function when pressing the delete button', async () => {
        const { component, getByText, workerQualificationSpy } = await setup(false);

        const deleteButton = getByText('Delete record');
        fireEvent.click(deleteButton);

        expect(workerQualificationSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.qualificationRecord.uid,
        );
      });

      it('should navigate to the qualification page when pressing the delete button and set a alert message in the history state', async () => {
        const { component, fixture, getByText, routerSpy } = await setup(false);
        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const deleteButton = getByText('Delete record');
        fireEvent.click(deleteButton);
        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl'], {
          state: { alertMessage: 'Qualification record deleted' },
        });
      });
    });
  });
});
