import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddEditTrainingComponent } from './add-edit-training.component';

describe('AddEditTrainingComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, queryByText } = await render(AddEditTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
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
        { provide: TrainingService, useClass: MockTrainingService },
        { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigateByUrl');
    routerSpy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      routerSpy,
      getByText,
      getByTestId,
      queryByText,
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

  it('should display the workers job role', async () => {
    const { component, getByTestId } = await setup();

    expect(getByTestId('workerNameAndRole').textContent).toContain(component.worker.mainJob.title);
  });

  describe('title', () => {
    it('should render the Enter training details title', async () => {
      const { component, fixture, getByText } = await setup();
      component.trainingRecordId = null;
      component.setTitle();
      fixture.detectChanges();
      expect(getByText('Enter training details')).toBeTruthy();
    });

    it('should render the Training details title, when there is a training record id', async () => {
      const { getByText } = await setup();
      expect(getByText('Training details')).toBeTruthy();
    });

    it('should render the Add mandatory training record title, when accessed from add mandatory training link', async () => {
      const { component, fixture, getByText } = await setup();

      component.mandatoryTraining = true;
      component.trainingRecordId = null;
      component.setTitle();
      fixture.detectChanges();

      expect(getByText('Add mandatory training record')).toBeTruthy();
    });

    it('should render the Mandatory training record title, when accessed from mandatory training title', async () => {
      const { component, fixture, getByText } = await setup();

      component.mandatoryTraining = true;
      component.setTitle();
      fixture.detectChanges();

      expect(getByText('Mandatory training record')).toBeTruthy();
    });
  });

  describe('delete button', () => {
    it('should render the delete button when editing training', async () => {
      const { component, fixture, getByText } = await setup();

      component.newTrainingAndQualificationsRecordsFlag = true;
      fixture.detectChanges();

      expect(getByText('Delete')).toBeTruthy();
    });

    it('should not render the delete button when there is no training id', async () => {
      const { component, fixture, queryByText } = await setup();

      component.newTrainingAndQualificationsRecordsFlag = true;
      component.trainingRecordId = null;
      fixture.detectChanges();

      expect(queryByText('Delete')).toBeFalsy();
    });
  });

  describe('Cancel button', () => {
    it('should call navigateByUrl when pressing cancel', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.previousUrl = ['/dashboard?view=categories#training-and-qualifications'];

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith('/dashboard?view=categories#training-and-qualifications');
    });
  });
});
