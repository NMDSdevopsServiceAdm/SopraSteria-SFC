import { render, fireEvent } from '@testing-library/angular';
import { IncludeTrainingCourseDetailsComponent } from './include-training-course-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WorkersModule } from '@features/workers/workers.module';
import { getTestBed } from '@angular/core/testing';
import { TrainingService } from '@core/services/training.service';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { BackLinkService } from '@core/services/backLink.service';
import { provideHttpClient } from '@angular/common/http';
import { MockTrainingServiceWithOverrides } from '@core/test-utils/MockTrainingService';

describe('IncludeTrainingCourseDetailsComponent', () => {
  const workplace = {
    uid: '1',
  };
  const worker = {
    uid: 123,
    nameOrId: 'John',
    mainJob: {
      title: 'Care Worker',
    },
  };

  const mockTrainingRecord = {
    title: 'Basic safeguarding for support staff',
    uid: 910,
  };

  const mockTrainingCourses = [
    {
      id: 1,
      uid: 'uid-1',
      trainingCategoryId: 2,
      name: 'Deprivation of liberty standards',
      accredited: YesNoDontKnow.Yes,
      deliveredBy: DeliveredBy.InHouseStaff,
      externalProviderName: null,
      howWasItDelivered: HowWasItDelivered.FaceToFace,
      doesNotExpire: false,
      validityPeriodInMonth: 24,
    },
    {
      id: 2,
      uid: 'uid-2',
      trainingCategoryId: 2,
      name: 'Basic safeguarding for support staff',
      accredited: YesNoDontKnow.No,
      deliveredBy: DeliveredBy.ExternalProvider,
      externalProviderName: 'Care skills academy',
      howWasItDelivered: HowWasItDelivered.ELearning,
      doesNotExpire: false,
      validityPeriodInMonth: 12,
    },
    {
      id: 3,
      uid: 'uid-3',
      trainingCategoryId: 2,
      name: 'Basic safeguarding for managers and leads',
      accredited: YesNoDontKnow.No,
      deliveredBy: DeliveredBy.ExternalProvider,
      externalProviderName: 'Care skills academy',
      howWasItDelivered: HowWasItDelivered.ELearning,
      doesNotExpire: false,
      validityPeriodInMonth: 12,
    },
  ];

  async function setup(overrides: any = {}) {
    const trainingCourses = overrides?.trainingCourses ?? [mockTrainingCourses[0]];
    const selectedTrainingCourse = overrides?.selectedTrainingCourse;
    const trainingRecord = overrides?.trainingRecord ?? mockTrainingRecord;

    const renderOptions = {
      imports: [WorkersModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: workplace,
                worker: worker,
                trainingRecord: trainingRecord,
                trainingCourses: trainingCourses,
              },
            },
          },
        },
        {
          provide: TrainingService,
          useFactory: MockTrainingServiceWithOverrides.factory({ _selectedTrainingCourse: selectedTrainingCourse }),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    };

    const setupTools = await render(IncludeTrainingCourseDetailsComponent, renderOptions);

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const trainingService = injector.inject(TrainingService) as TrainingService;
    const backLinkService = injector.inject(BackLinkService) as BackLinkService;
    const showBackLinkSpy = spyOn(backLinkService, 'showBackLink');
    const setSelectedTrainingCourseSpy = spyOn(trainingService, 'setSelectedTrainingCourse');

    return {
      ...setupTools,
      component,
      routerSpy,
      setSelectedTrainingCourseSpy,
      showBackLinkSpy,
      worker,
      workplace,
    };
  }

  describe('page render', () => {
    it('should render a IncludeTrainingCourseDetailsComponent', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    });

    it(`displays a Back link`, async () => {
      const { component, showBackLinkSpy } = await setup();

      component.ngOnInit();

      expect(showBackLinkSpy).toHaveBeenCalled();
    });

    it('should display the worker name', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('workerName');
      expect(heading.textContent).toEqual('John');
    });

    it('should display the correct page heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('page-heading');
      expect(heading.textContent).toEqual('Select a training course');
    });

    describe('Additional details section', () => {
      it('should display the dropdown toggle', async () => {
        const { getByTestId } = await setup();
        const toggle = getByTestId('details-toggle');
        expect(toggle.textContent.trim()).toEqual(
          'Why is it a good idea to update records with training course details?',
        );
      });
    });

    describe('Training record', () => {
      it('should display the header', async () => {
        const { getByTestId } = await setup();
        const header = getByTestId('training-record-heading');
        expect(header.textContent).toContain('Training record name');
      });

      it('should contain the name of the training record', async () => {
        const { getByTestId } = await setup();
        const name = getByTestId('training-record-name');
        expect(name.textContent).toContain('Basic safeguarding for support staff');
      });
    });

    describe('Training course name options', () => {
      it('should display the header', async () => {
        const { getByTestId } = await setup();
        const name = getByTestId('training-course-heading');
        expect(name.textContent).toContain('Training course name');
      });

      describe('When a single course matches the training record', () => {
        it('should display the correct course related to the training record as a checkbox', async () => {
          const { getByTestId, queryAllByRole } = await setup();
          const name = getByTestId('checkbox-label');
          const radioOptions = queryAllByRole('radio');

          expect(name.textContent).toContain('Deprivation of liberty standards');
          expect(radioOptions.length).toBe(0);
        });
      });

      describe('When multiple courses match the training record', () => {
        it('should display the correct courses related to the training record as radios', async () => {
          const { queryAllByRole, queryByTestId } = await setup({ trainingCourses: mockTrainingCourses });
          const name = queryByTestId('training-course-name-checkbox');
          const radioOptions = queryAllByRole('radio');

          expect(name).toBe(null);
          expect(radioOptions.length).toBe(3);
        });
      });
    });

    describe('Continue button', () => {
      it('should be displayed correctly', async () => {
        const { getByRole } = await setup();
        const button = getByRole('button', { name: 'Continue' });

        expect(button).toBeTruthy();
      });

      describe('When page has a course selection checkbox', () => {
        describe('When the checkbox is ticked', () => {
          it(`should call the training service with the selected course`, async () => {
            const { fixture, getByTestId, getByRole, setSelectedTrainingCourseSpy } = await setup({
              trainingCourses: [mockTrainingCourses[0]],
            });

            const checkbox = getByTestId('training-course-name-checkbox');
            const button = getByRole('button', { name: 'Continue' });
            fireEvent.click(checkbox);
            fixture.detectChanges();

            fireEvent.click(button);
            expect(setSelectedTrainingCourseSpy).toHaveBeenCalledWith(mockTrainingCourses[0]);
          });

          it(`should navigate to the correct page`, async () => {
            const { fixture, getByTestId, getByRole, routerSpy } = await setup();

            const checkbox = getByTestId('training-course-name-checkbox');
            const button = getByRole('button', { name: 'Continue' });
            fireEvent.click(checkbox);
            fixture.detectChanges();

            fireEvent.click(button);
            expect(routerSpy).toHaveBeenCalledWith([
              '/workplace',
              '1',
              'training-and-qualifications-record',
              123,
              'training',
              910,
              'matching-layout',
            ]);
          });
        });

        describe('When the checkbox is not ticked', () => {
          it(`should not call the training service`, async () => {
            const { getByRole, setSelectedTrainingCourseSpy } = await setup();

            const button = getByRole('button', { name: 'Continue' });
            fireEvent.click(button);

            expect(setSelectedTrainingCourseSpy).not.toHaveBeenCalled();
          });

          it(`should navigate to the previous page`, async () => {
            const { component, getByRole, routerSpy } = await setup();

            const button = getByRole('button', { name: 'Continue' });
            fireEvent.click(button);

            const previousPage = [
              '/workplace',
              component.workplace.uid,
              'training-and-qualifications-record',
              component.worker.uid,
              'training',
              component.trainingRecord.uid,
            ];

            expect(routerSpy).toHaveBeenCalledWith(previousPage);
          });
        });
        describe('When the checkbox is ticked and unticked', () => {
          it(`should not call the training service`, async () => {
            const { fixture, getByRole, getByTestId, setSelectedTrainingCourseSpy } = await setup();

            const checkbox = getByTestId('training-course-name-checkbox');
            const button = getByRole('button', { name: 'Continue' });
            fireEvent.click(checkbox);
            fixture.detectChanges();

            fireEvent.click(checkbox);
            fixture.detectChanges();

            fireEvent.click(button);
            expect(setSelectedTrainingCourseSpy).not.toHaveBeenCalled();
          });

          it(`should navigate to the previous page`, async () => {
            const { component, fixture, getByRole, getByTestId, routerSpy } = await setup();

            const checkbox = getByTestId('training-course-name-checkbox');
            const button = getByRole('button', { name: 'Continue' });
            fireEvent.click(checkbox);
            fixture.detectChanges();

            fireEvent.click(checkbox);
            fixture.detectChanges();

            fireEvent.click(button);

            const previousPage = [
              '/workplace',
              component.workplace.uid,
              'training-and-qualifications-record',
              component.worker.uid,
              'training',
              component.trainingRecord.uid,
            ];

            expect(routerSpy).toHaveBeenCalledWith(previousPage);
          });
        });
      });

      describe('When page has course selection radios', () => {
        describe('When a radio is selected', () => {
          it(`should call the training service with the chosen course`, async () => {
            const { fixture, getByTestId, getByRole, setSelectedTrainingCourseSpy } = await setup({
              trainingCourses: mockTrainingCourses,
            });

            const radio = getByTestId('radio-2');
            const button = getByRole('button', { name: 'Continue' });
            fireEvent.click(radio);
            fixture.detectChanges();

            fireEvent.click(button);
            expect(setSelectedTrainingCourseSpy).toHaveBeenCalledWith(mockTrainingCourses[1]);
          });

          it(`should navigate to the correct page`, async () => {
            const { fixture, getByText, getByRole, routerSpy } = await setup();

            const checkbox = getByText(mockTrainingCourses[0].name);
            const button = getByRole('button', { name: 'Continue' });
            fireEvent.click(checkbox);
            fixture.detectChanges();

            fireEvent.click(button);
            expect(routerSpy).toHaveBeenCalledWith([
              '/workplace',
              '1',
              'training-and-qualifications-record',
              123,
              'training',
              910,
              'matching-layout',
            ]);
          });
        });
      });

      describe('When a radio is not selected', () => {
        it(`should call the training service with the chosen course`, async () => {
          const { getByRole, setSelectedTrainingCourseSpy } = await setup({ trainingCourses: mockTrainingCourses });

          const button = getByRole('button', { name: 'Continue' });
          fireEvent.click(button);

          expect(setSelectedTrainingCourseSpy).not.toHaveBeenCalled();
        });

        it(`should navigate to the previous page`, async () => {
          const { component, getByRole, routerSpy } = await setup();

          const button = getByRole('button', { name: 'Continue' });
          fireEvent.click(button);

          const previousPage = [
            '/workplace',
            component.workplace.uid,
            'training-and-qualifications-record',
            component.worker.uid,
            'training',
            component.trainingRecord.uid,
          ];

          expect(routerSpy).toHaveBeenCalledWith(previousPage);
        });
      });
    });

    describe('Cancel link', () => {
      it('should be displayed correctly', async () => {
        const { queryByTestId } = await setup();
        const link = queryByTestId('cancel-link');
        expect(link.textContent).toContain('Cancel');
      });

      it('should have the correct href', async () => {
        const { queryByTestId } = await setup();
        const link = queryByTestId('cancel-link');
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${workplace.uid}/training-and-qualifications-record/${worker.uid}/training/${mockTrainingRecord.uid}`,
        );
      });
    });
  });

  describe('prefill', () => {
    it('should prefill the radio button if there is a course selected', async () => {
      const { getByRole } = await setup({
        trainingCourses: mockTrainingCourses,
        selectedTrainingCourse: mockTrainingCourses[1],
      });

      const radioButton = getByRole('radio', { name: mockTrainingCourses[1].name }) as HTMLInputElement;
      expect(radioButton.checked).toBeTrue();
    });

    it('should prefill the radio button if no course selected before but the training record is linked to a course', async () => {
      const { getByRole } = await setup({
        trainingCourses: mockTrainingCourses,
        trainingRecord: { ...mockTrainingRecord, trainingCourseFK: mockTrainingCourses[1].id },
      });

      const radioButton = getByRole('radio', { name: mockTrainingCourses[1].name }) as HTMLInputElement;
      expect(radioButton.checked).toBeTrue();
    });

    it('should not prefill if the training record is not linked to any course', async () => {
      const { getAllByRole } = await setup({
        trainingCourses: mockTrainingCourses,
      });

      const radioButtons = getAllByRole('radio') as HTMLInputElement[];
      radioButtons.forEach((button) => {
        expect(button.checked).toBeFalse();
      });
    });

    it('should not prefill if there is only one course', async () => {
      const { queryAllByRole, getByRole } = await setup({
        trainingCourses: [mockTrainingCourses[0]],
        selectedTrainingCourse: mockTrainingCourses[0],
      });

      const radioButtons = queryAllByRole('radio') as HTMLInputElement[];
      expect(radioButtons).toHaveSize(0);

      const checkbox = getByRole('checkbox', { name: mockTrainingCourses[0].name }) as HTMLInputElement;
      expect(checkbox.checked).toBeFalse();
    });
  });
});
