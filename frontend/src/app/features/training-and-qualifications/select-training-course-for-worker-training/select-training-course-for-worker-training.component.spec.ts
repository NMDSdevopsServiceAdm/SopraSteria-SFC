import { fireEvent, render, within } from '@testing-library/angular';
import { SelectTrainingCourseForWorkerTraining } from './select-training-course-for-worker-training.component';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
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
import { TrainingCourse } from '@core/model/training-course.model';

describe('SelectTrainingCourseForWorkerTraining', () => {
  const continueWithOutCourseOptionText = 'Continue without selecting a training course';
  const trainingCourses = [
    {
      id: 1,
      uid: 'uid-1',
      trainingCategoryId: 1,
      name: 'Care skills and knowledge',
      trainingCategoryName: 'Activity provision, wellbeing',
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
      trainingCategoryName: 'Basic life support and first aid',
      accredited: YesNoDontKnow.No,
      deliveredBy: DeliveredBy.ExternalProvider,
      externalProviderName: 'Care skills academy',
      howWasItDelivered: HowWasItDelivered.ELearning,
      doesNotExpire: false,
      validityPeriodInMonth: 12,
    },
  ] as TrainingCourse[];
  async function setup(overrides: any = {}) {
    const queryParams = overrides?.queryParams ?? null;
    const setupTools = await render(SelectTrainingCourseForWorkerTraining, {
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
            resetState() {},
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { trainingCourses },
              queryParams: queryParams,
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
    const resetStateSpy = spyOn(trainingService, 'resetState');

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
      setIsTrainingCourseSelectedSpy,
      setSelectedTrainingCourseSpy,
      resetStateSpy,
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

    const caption = getByTestId('section');

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

  it('should show the sub text above the course radio buttons', async () => {
    const { getByText } = await setup();

    expect(getByText('Select a training course for this record')).toBeTruthy();
  });

  it('should show a "Continue" button', async () => {
    const { getByRole } = await setup();

    const button = getByRole('button', { name: 'Continue' });

    expect(button).toBeTruthy();
  });

  it(`should navigate to "add-training-without-course" selecting ${continueWithOutCourseOptionText}`, async () => {
    const {
      component,
      fixture,
      getByText,
      getByRole,
      routerSpy,
      setIsTrainingCourseSelectedSpy,
      setSelectedTrainingCourseSpy,
    } = await setup();

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
      'add-training-without-course',
    ]);
    expect(setIsTrainingCourseSelectedSpy).toHaveBeenCalledWith(false);
    expect(setSelectedTrainingCourseSpy).not.toHaveBeenCalled();
  });

  it(`should navigate to "matching-layout" after selecting a training course`, async () => {
    const {
      component,
      fixture,
      getByText,
      getByRole,
      routerSpy,
      setIsTrainingCourseSelectedSpy,
      setSelectedTrainingCourseSpy,
    } = await setup();

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
    expect(setIsTrainingCourseSelectedSpy).toHaveBeenCalledWith(true);
    expect(setSelectedTrainingCourseSpy).toHaveBeenCalledWith(trainingCourses[0]);
  });

  it('should show a "Cancel" link and go back to the staff training page', async () => {
    const { component, getByRole, fixture, routerSpy, resetStateSpy } = await setup();

    const link = getByRole('link', { name: 'Cancel' });

    expect(link).toBeTruthy();

    fireEvent.click(link);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      component.workplace.uid,
      'training-and-qualifications-record',
      component.worker.uid,
      'training',
    ]);

    expect(resetStateSpy).toHaveBeenCalled();
  });

  it('should show an error message if "Continue" is clicked without selecting a radio option', async () => {
    const { fixture, getByRole, getAllByText } = await setup();

    const button = getByRole('button', { name: 'Continue' });

    fireEvent.click(button);
    fixture.detectChanges();

    expect(
      getAllByText('Continue without selecting a training course or select the training course taken').length,
    ).toEqual(2);
  });

  describe('prefill', () => {
    it('should not prefill if the previous page was not "add-training-without-course"', async () => {
      const { getByLabelText } = await setup();

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should not prefill if the previous page was "add-training-without-course" and isTrainingCourseSelected is null', async () => {
      const overrides = {
        isTrainingCourseSelected: null,
        previousUrl: 'add-training-without-course',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should not prefill if the previous page was "add-training-without-course" and isTrainingCourseSelected is undefined', async () => {
      const overrides = {
        isTrainingCourseSelected: undefined,
        previousUrl: 'add-training-without-course',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should not prefill if the previous page was "add-training-without-course" and isTrainingCourseSelected is true', async () => {
      const overrides = {
        isTrainingCourseSelected: true,
        previousUrl: 'add-training-without-course',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it(`should prefill if the previous answer is ${continueWithOutCourseOptionText} and previous page was "add-training-without-course"`, async () => {
      const overrides = {
        isTrainingCourseSelected: false,
        previousUrl: 'add-training-without-course',
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

  describe('when trainingCategory is passed in query params from previous page', async () => {
    it('should pass the query params to next page if user chose continue without a training course', async () => {
      const mockQueryParams = {
        trainingCategory: JSON.stringify({
          id: trainingCourses[1].trainingCategoryId,
          category: trainingCourses[1].trainingCategoryName,
        }),
      };
      const { component, getByLabelText, getByRole, routerSpy } = await setup({ queryParams: mockQueryParams });

      fireEvent.click(getByLabelText(continueWithOutCourseOptionText));

      fireEvent.click(getByRole('button', { name: 'Continue' }));

      expect(routerSpy).toHaveBeenCalledWith(
        [
          '/workplace',
          component.workplace.uid,
          'training-and-qualifications-record',
          component.worker.uid,
          'add-training-without-course',
        ],
        {
          queryParams: mockQueryParams,
        },
      );
    });
  });
});
