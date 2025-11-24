import { fireEvent, render, within } from '@testing-library/angular';
import { SelectTrainingCourseForMultipleTrainingRecords } from './select-training-course-for-multiple-training-records.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BackLinkService } from '@core/services/backLink.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { EstablishmentService } from '@core/services/establishment.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPreviousRouteService } from '@core/test-utils/MockPreviousRouteService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { getTestBed } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
import { TrainingService } from '@core/services/training.service';

describe('SelectTrainingCourseForMultipleTrainingRecords', () => {
  const continueWithOutCourseOptionText = 'Continue without selecting a training course';
  const trainingCourses = [trainingCourseBuilder(), trainingCourseBuilder()];

  async function setup(overrides: any = {}) {
    const setupTools = await render(SelectTrainingCourseForMultipleTrainingRecords, {
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
          useFactory: MockPreviousRouteService.factory(overrides?.previousUrl),
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

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByTestId } = await setup();

    const heading = getByTestId('heading');

    expect(heading).toBeTruthy();
    expect(within(heading).getByText('How do you want to continue?')).toBeTruthy;
  });

  it('should show the caption', async () => {
    const { getByTestId } = await setup();

    const caption = getByTestId('section');

    expect(caption).toBeTruthy();
    expect(within(caption).getByText('Add multiple training records')).toBeTruthy();
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

    expect(getByText('Select the training course taken')).toBeTruthy();
  });

  it('should show a "Cancel" link and go back to the training and qualifications page', async () => {
    const { getByRole, routerSpy, fixture, resetStateSpy } = await setup();

    const link = getByRole('link', { name: 'Cancel' });

    expect(link).toBeTruthy();

    fireEvent.click(link);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'training-and-qualifications' });
    expect(resetStateSpy).toHaveBeenCalled();
  });

  it('should show a "Continue" button', async () => {
    const { getByRole } = await setup();

    const button = getByRole('button', { name: 'Continue' });

    expect(button).toBeTruthy();
  });

  it(`should navigate to "select-training-category" when selecting ${continueWithOutCourseOptionText}`, async () => {
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
      'add-multiple-training',
      'select-training-category',
    ]);
    expect(setIsTrainingCourseSelectedSpy).toHaveBeenCalledWith(false);
    expect(setSelectedTrainingCourseSpy).not.toHaveBeenCalled();
  });

  it(`should navigate to "update-url" after selecting a training course`, async () => {
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
      'add-multiple-training',
      'update-url',
    ]);
    expect(setIsTrainingCourseSelectedSpy).toHaveBeenCalledWith(true);
    expect(setSelectedTrainingCourseSpy).toHaveBeenCalledWith(trainingCourses[0]);
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
    it('should not prefill if the previous url does not contain "add-multiple-training"', async () => {
      const overrides = {
        isTrainingCourseSelected: false,
        previousUrl: 'add-staff',
      };

      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should not prefill if the previous url contains "add-multiple-training" and isTrainingCourseSelected is null', async () => {
      const overrides = {
        isTrainingCourseSelected: null,
        previousUrl: 'add-multiple-training/select-training-category',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should not prefill if the previous url contains "add-multiple-training" and isTrainingCourseSelected is undefined', async () => {
      const overrides = {
        isTrainingCourseSelected: undefined,
        previousUrl: 'add-multiple-training/select-training-category',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should not prefill if the previous url contains "add-multiple-training" and isTrainingCourseSelected is true', async () => {
      const overrides = {
        isTrainingCourseSelected: true,
        previousUrl: 'add-multiple-training/select-staff',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeFalsy();

      trainingCourses.forEach((radioOption) => {
        const radioButton = getByLabelText(radioOption.name) as HTMLInputElement;
        expect(radioButton.checked).toBeFalsy();
      });
    });

    it('should prefill if the previous answer is ${continueWithOutCourseOptionText} and the previous url contains "add-multiple-training/select-staff"', async () => {
      const overrides = {
        isTrainingCourseSelected: false,
        previousUrl: 'add-multiple-training/select-staff',
      };

      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeTruthy();
    });

    xit(`should prefill if the previous answer is ${trainingCourses[0].name} and previous url contains "add-multiple-training/select-staff"`, async () => {
      const overrides = {
        isTrainingCourseSelected: true,
        previousUrl: 'add-multiple-training/select-staff',
        selectedTrainingCourse: trainingCourses[0],
      };
      const { getByLabelText } = await setup(overrides);

      const radioButton = getByLabelText(trainingCourses[0].name) as HTMLInputElement;
      expect(radioButton.checked).toBeTruthy();
    });

    it(`should prefill if the previous answer is ${continueWithOutCourseOptionText} and previous url contains "add-multiple-training"`, async () => {
      const overrides = {
        isTrainingCourseSelected: false,
        previousUrl: 'add-multiple-training/select-training-category',
      };
      const { getByLabelText } = await setup(overrides);

      const noCourseRadioButton = getByLabelText(continueWithOutCourseOptionText) as HTMLInputElement;
      expect(noCourseRadioButton.checked).toBeTruthy();
    });

    // this will need updating when the new page is created
    it(`should prefill if the previous answer is ${trainingCourses[0].name} and previous page was "update-url"`, async () => {
      const overrides = {
        isTrainingCourseSelected: true,
        previousUrl: 'update-url',
        selectedTrainingCourse: trainingCourses[0],
      };
      const { getByLabelText } = await setup(overrides);

      const radioButton = getByLabelText(trainingCourses[0].name) as HTMLInputElement;
      expect(radioButton.checked).toBeTruthy();
    });
  });
});
