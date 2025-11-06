import { fireEvent, render, within } from '@testing-library/angular';
import { AddATrainingRecord } from './add-a-training-record.component';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { DeliveredBy, HowWasItDelivered, Training } from '@core/model/training.model';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { BackLinkService } from '@core/services/backLink.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { MockPreviousRouteService } from '@core/test-utils/MockPreviousRouteService';
import { TrainingService } from '@core/services/training.service';

describe('AddATrainingRecord', () => {
  const continueWithOutCourseOptionText = 'Continue without selecting a saved course';
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
      validityPeriodInMonth: 12,
    },
  ];
  async function setup(overrides: any = {}) {
    const setupTools = await render(AddATrainingRecord, {
      imports: [RouterModule, ReactiveFormsModule, SharedModule],
      declarations: [],
      providers: [
        UntypedFormBuilder,
        BackLinkService,
        {
          provide: WorkerService,
          useClass: MockWorkerServiceWithWorker,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PreviousRouteService,
          useFactory: MockPreviousRouteService.factory(overrides.previousUrl),
          deps: [Router],
        },
        {
          provide: TrainingService,
          useValue: {
            setIsTrainingCourseSelected() {},
            getIsTrainingCourseSelected() {
              return overrides?.isTrainingCourseSelected ?? null;
            },
            setSelectedTrainingCourse() {},
            getSelectedTrainingCourse() {
              return overrides.selectedTrainingCourse ?? null;
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { trainingCourses },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const setIsTrainingCourseSelectedSpy = spyOn(trainingService, 'setIsTrainingCourseSelected');
    const setSelectedTrainingCourseSpy = spyOn(trainingService, 'setSelectedTrainingCourse');

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
      setIsTrainingCourseSelectedSpy,
      setSelectedTrainingCourseSpy,
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

    expect(getByLabelText(continueWithOutCourseOptionText)).toBeTruthy();
    trainingCourses.forEach((radioOption) => {
      expect(getByLabelText(radioOption.name)).toBeTruthy();
    });
  });

  it('should show a "Continue" button', async () => {
    const { getByRole } = await setup();

    const button = getByRole('button', { name: 'Continue' });

    expect(button).toBeTruthy();
  });

  it(`should navigate to "add-training" selecting ${continueWithOutCourseOptionText}`, async () => {
    const { component, fixture, getByText, getByRole, routerSpy } = await setup();

    const button = getByRole('button', { name: 'Continue' });
    const option = getByText(continueWithOutCourseOptionText);

    fireEvent.click(option);
    fireEvent.click(button);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      component.workplace.uid,
      'training-and-qualifications-record',
      component.worker.uid,
      'add-training',
    ]);
  });

  it(`should navigate to "add-training" after selecting a training course`, async () => {
    const { component, fixture, getByText, getByRole, routerSpy } = await setup();

    const button = getByRole('button', { name: 'Continue' });
    const option = getByText(trainingCourses[0].name);

    fireEvent.click(option);
    fireEvent.click(button);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      component.workplace.uid,
      'training-and-qualifications-record',
      component.worker.uid,
      'matching-layout',
    ]);
  });

  it('should show a "Cancel" link and go back to the staff training page', async () => {
    const { component, getByRole } = await setup();

    const link = getByRole('link', { name: 'Cancel' });

    expect(link).toBeTruthy();

    expect(link.getAttribute('href')).toEqual(
      `/workplace/${component.workplace.uid}/training-and-qualifications-record/${component.worker.uid}/training`,
    );
  });

  it('should show an error message if "Continue" is clicked without selecting a radio option', async () => {
    const { fixture, getByRole, getAllByText } = await setup();

    const button = getByRole('button', { name: 'Continue' });

    fireEvent.click(button);
    fixture.detectChanges();

    expect(getAllByText('Continue without selecting a saved course or select a saved course').length).toEqual(2);
  });

  describe('prefill', () => {
    it('should not prefill if the previous page was not "add-training"', async () => {
      const { getByLabelText } = await setup();

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should not prefill if the previous page was "add-training" and isTrainingCourseSelected is null', async () => {
      const overrides = {
        isTrainingCourseSelected: null,
        previousUrl: 'add-training',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should not prefill if the previous page was "add-training" and isTrainingCourseSelected is undefined', async () => {
      const overrides = {
        isTrainingCourseSelected: undefined,
        previousUrl: 'add-training',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it(`should prefill if the previous answer is ${continueWithOutCourseOptionText} and previous page was "add-training"`, async () => {
      const overrides = {
        isTrainingCourseSelected: false,
        previousUrl: 'add-training',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeTruthy();
    });

    it(`should prefill if the previous answer is ${trainingCourses[0].name} and previous page was "matching-layout"`, async () => {
      const overrides = {
        isTrainingCourseSelected: true,
        previousUrl: 'matching-layout',
        selectedTrainingCourse: trainingCourses[0],
      };
      const { getByLabelText } = await setup(overrides);

      const radioButton = getByLabelText(trainingCourses[0].name) as HTMLInputElement;
      expect(radioButton.checked).toBeTruthy();
    });
  });
});
