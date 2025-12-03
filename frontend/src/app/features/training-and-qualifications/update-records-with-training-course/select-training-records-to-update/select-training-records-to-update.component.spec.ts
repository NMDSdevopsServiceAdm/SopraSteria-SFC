import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { TrainingCourseService } from '@core/services/training-course.service';
import { MockTrainingCourseService, trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { trainingRecordBuilder } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SelectTrainingRecordsToUpdateComponent } from './select-training-records-to-update.component';

fdescribe('SelectTrainingRecordsToUpdateComponent', () => {
  const mockEstablishmentUid = 'mock-establishment-uid';

  const mockSelectedTrainingCourse = {
    ...trainingCourseBuilder(),
    linkableTrainingRecords: [trainingRecordBuilder(), trainingRecordBuilder()],
  };

  async function setup(overrides: any = {}) {
    const selectedTrainingCourse = overrides?.selectedTrainingCourse ?? mockSelectedTrainingCourse;
    const mockTrainingCoursesWithLinkableRecords: Array<TrainingCourse> = [
      trainingCourseBuilder(),
      selectedTrainingCourse,
      trainingCourseBuilder(),
    ];

    const trainingCoursesWithLinkableRecords =
      overrides?.trainingCoursesWithLinkableRecords ?? mockTrainingCoursesWithLinkableRecords;

    const setupTools = await render(SelectTrainingRecordsToUpdateComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: TrainingCourseService,
          useFactory: MockTrainingCourseService.factory({}),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { trainingCoursesWithLinkableRecords },
              params: { establishmentuid: mockEstablishmentUid, trainingCourseUid: selectedTrainingCourse.uid },
              root: { children: [], url: [''] },
            },
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: mockEstablishmentUid,
                  },
                },
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const route = injector.inject(ActivatedRoute) as ActivatedRoute;
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);

    const trainingCourseService = injector.inject(TrainingCourseService);

    return {
      ...setupTools,
      component,
      route,
      routerSpy,
      trainingCourseService,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a heading and a caption', async () => {
    const { getByRole, getByTestId } = await setup();

    const expectedHeading = 'Select the training records that you want to update';
    const expectedCaption = 'Update records with training course details';

    expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeading);
    expect(getByTestId('section-heading').textContent).toContain(expectedCaption);
  });

  it('should show a reveal text to explain what is the care workforce pathway', async () => {
    const { getByTestId } = await setup();
    const revealTextTitle = 'Why is it a good idea to update records with training course details?';
    const revealTextContents = [
      "It's a good idea because your training records will then be consistent with each other, sharing the same details, like course name and validity. We match records to courses by category and when you update them they'll:",
      'take the name of the training course',
      'say whether the training is accredited',
      'say how the training was delivered and who delivered it',
      'show how long the training is valid for',
      'still generate alerts when the training is due to expire',
      'keep any certificates and notes that were added',
    ];

    const revealElement = getByTestId('reveal-why-is-it-a-good-idea');
    expect(revealElement.textContent).toContain(revealTextTitle);
    revealTextContents.forEach((paragraph) => {
      expect(revealElement.textContent).toContain(paragraph);
    });
  });

  it('should show the name of selected training course', async () => {
    const { getByTestId } = await setup();

    const trainingCourseNameSection = getByTestId('training-course-name');

    expect(trainingCourseNameSection.textContent).toContain('Training course name');
    expect(trainingCourseNameSection.textContent).toContain(mockSelectedTrainingCourse.name);
  });

  it('should show checkboxes of training records to select', async () => {
    const mockLinkableTrainingRecords = [
      trainingRecordBuilder({ overrides: { title: 'training A' } }),
      trainingRecordBuilder({ overrides: { title: 'training B' } }),
      trainingRecordBuilder({ overrides: { title: 'training A' } }),
      trainingRecordBuilder({ overrides: { title: 'training A' } }),
    ];

    const selectedTrainingCourse = {
      ...trainingCourseBuilder(),
      linkableTrainingRecords: mockLinkableTrainingRecords,
    };
    const { getByRole } = await setup({ selectedTrainingCourse });

    // expect(getByRole('checkbox', { name: 'training A (3 records)' })).toBeTruthy();
    expect(getByRole('checkbox', { name: 'training B (1 record)' })).toBeTruthy();
  });

  it('should show a Continue button and a cancel link', async () => {});
});
