import { fireEvent, getByText, render, within } from '@testing-library/angular';
import { AddATrainingRecord } from './add-a-training-record.component';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { getTestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

fdescribe('AddATrainingRecord', () => {
  const continueText = 'Continue without selecting a saved course';
  const trainingCourses = [
    {
      id: 1,
      uid: 'uid-1',
      trainingCategoryId: 1,
      name: 'Care skills and knowledge',
      accredited: YesNoDontKnow.Yes,
      deliveredBy: DeliveredBy.InHouseStaff,
      externalProviderName: null,
      howWasItDelivered: HowWasItDelivered.FaceToFace,
      doesNotExpire: false,
      validityPeriodInMonth: 24,
    },
    {
      id: 2,
      uid: 'uid-1',
      trainingCategoryId: 2,
      name: 'First aid course',
      accredited: YesNoDontKnow.No,
      deliveredBy: DeliveredBy.ExternalProvider,
      externalProviderName: 'Care skills academy',
      howWasItDelivered: HowWasItDelivered.ELearning,
      doesNotExpire: false,
      validityPeriodInMonth: 24,
    },
  ];
  async function setup(overrides: any = {}) {
    const setupTools = await render(AddATrainingRecord, {
      imports: [RouterModule, ReactiveFormsModule],
      declarations: [],
      providers: [
        UntypedFormBuilder,
        {
          provide: WorkerService,
          useClass: MockWorkerServiceWithWorker,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ],
    });

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByTestId } = await setup();

    const heading = getByTestId('heading');

    expect(heading).toBeTruthy();
    expect(within(heading).getByText('Add a training record')).toBeTruthy;
  });

  it('should show the worker name in caption', async () => {
    const { component, getByTestId } = await setup();

    const caption = getByTestId('workerName');

    expect(caption).toBeTruthy();
    expect(within(caption).getByText(component.worker.nameOrId)).toBeTruthy();
  });

  it('should show the radio buttons with a list of saved training courses', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText(continueText)).toBeTruthy();
    trainingCourses.forEach((radioOption) => {
      expect(getByLabelText(radioOption.name)).toBeTruthy();
    });
  });

  it('should show a "Continue" button', async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should show a "Cancel" link and go back to the ', async () => {
    const { component, getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();

    expect(cancelLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplace.uid}/training-and-qualifications-record/${component.worker.uid}`
    )
  });
});
