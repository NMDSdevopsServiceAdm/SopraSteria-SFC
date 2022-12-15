import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MultipleTrainingResponse } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { fireEvent, render } from '@testing-library/angular';
import { Observable } from 'rxjs';
import { ConfirmMultipleTrainingComponent } from './confirm-multiple-training.component';

describe('ConfirmMultipleTrainingComponent', () => {
  async function setup() {
    const { fixture, getByTestId, getByText } = await render(ConfirmMultipleTrainingComponent, {
      imports: [HttpClientTestingModule, RouterModule, RouterTestingModule],
      providers: [
        AlertService,
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: {
                  uid: '123',
                },
              },
            },
          },
        },
        {
          provide: TrainingService,
          useClass: MockTrainingServiceWithPreselectedStaff,
        },
      ],
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();

    const workerService = injector.inject(WorkerService) as WorkerService;

    const workerSpy = spyOn(workerService, 'createMultipleTrainingRecords');
    workerSpy.and.callFake(() => {
      return new Observable<MultipleTrainingResponse>();
    });

    return { component, fixture, getByTestId, getByText, workerSpy };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct title and heading', async () => {
    const { component, getByText } = await setup();
    expect(getByText('Add multiple records')).toBeTruthy();
    expect(getByText('Summary')).toBeTruthy();
  });

  it('should display the correct text', async () => {
    const { component, getByText } = await setup();
    expect(getByText('Check these details before you confirm them.')).toBeTruthy;
  });

  it('should display the confirm button', async () => {
    const { component, getByTestId } = await setup();
    const button = getByTestId('confirmButton');
    expect(button.textContent).toBe('Confirm details');
  });

  it('should display the MultipleTrainingSummaryComponent', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('selectedStaffSummary')).toBeTruthy();
  });

  it('should submit when complete', async () => {
    const { component, getByText, fixture, workerSpy } = await setup();

    const finishButton = getByText('Confirm details');
    fireEvent.click(finishButton);
    fixture.detectChanges();

    expect(workerSpy).toHaveBeenCalledWith('123', ['1234'], {
      trainingCategory: { id: 1 },
      title: 'Title',
      accredited: true,
      completed: null,
      expires: null,
      notes: null,
    });
  });
});
