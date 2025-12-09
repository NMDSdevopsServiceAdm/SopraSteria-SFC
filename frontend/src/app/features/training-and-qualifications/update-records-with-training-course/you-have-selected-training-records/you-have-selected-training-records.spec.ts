import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { TrainingCourseService } from '@core/services/training-course.service';
import { MockTrainingCourseService, trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { YouHaveSelectedTrainingRecords } from './you-have-selected-training-records';

fdescribe('YouHaveSelectedTrainingRecords', () => {
  const mockEstablishmentUid = 'mock-establishment-uid';
  const mockSelectedTrainingCourseUid = 'mock-selected-training-course-uid';
  const mockSelectedTrainingCourse = trainingCourseBuilder({
    overrides: { name: 'mock-training-course', uid: mockSelectedTrainingCourseUid },
  });

  const mocktrainingRecordsSelectedForUpdate = [
    { uid: 'training-record-uid-1', title: 'First aid basic' },
    { uid: 'training-record-uid-2', title: 'First aid basic' },
    { uid: 'training-record-uid-3', title: 'First aid basic training' },
    { uid: 'training-record-uid-4', title: 'First aid basic 101' },
    { uid: 'training-record-uid-5', title: 'First aid basic' },
    { uid: 'training-record-uid-6', title: 'First aid basic training' },
    { uid: 'training-record-uid-7', title: 'Basic of first aid' },
  ];

  const trainingCoursesWithLinkableRecords: Array<TrainingCourse> = [
    trainingCourseBuilder(),
    mockSelectedTrainingCourse,
    trainingCourseBuilder(),
  ];

  async function setup(overrides: any = {}) {
    const trainingRecordsSelectedForUpdate =
      overrides?.trainingRecordsSelectedForUpdate ?? mocktrainingRecordsSelectedForUpdate;

    const setupTools = await render(YouHaveSelectedTrainingRecords, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: TrainingCourseService,
          useFactory: MockTrainingCourseService.factory({ trainingRecordsSelectedForUpdate }),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { trainingCoursesWithLinkableRecords },
              params: { establishmentuid: mockEstablishmentUid, trainingCourseUid: mockSelectedTrainingCourseUid },
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

    const expectedHeading = `You've selected ${mocktrainingRecordsSelectedForUpdate.length} training records to update with course details`;
    const expectedCaption = 'Training and qualifications';

    expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeading);
    expect(getByTestId('section-heading').textContent).toContain(expectedCaption);
  });

  describe('should show the heading with singular / plural noun correctly', () => {
    it('singular', async () => {
      const trainingRecordsSelectedForUpdate = [mocktrainingRecordsSelectedForUpdate[1]];
      const expectedHeading = "You've selected 1 training record to update with course details";

      const { getByRole } = await setup({ trainingRecordsSelectedForUpdate });

      expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeading);
    });

    it('plural', async () => {
      const trainingRecordsSelectedForUpdate = mocktrainingRecordsSelectedForUpdate.slice(0, 3);
      const expectedHeading = "You've selected 3 training records to update with course details";

      const { getByRole } = await setup({ trainingRecordsSelectedForUpdate });

      expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeading);
    });
  });

  it('should show a paragraph including the training course name', async () => {
    const expectedText = `Details from the '${mockSelectedTrainingCourse.name}' training course will be added to the training records that you called:`;

    const { getByText } = await setup();

    expect(getByText(expectedText)).toBeTruthy();
  });

  it('should show a list of the selected training records, grouped by name', async () => {
    const { getByTestId, getByText } = await setup();

    const trainingRecords = getByTestId('selected-training-records');
    expect(trainingRecords).toBeTruthy();

    const expectedListEntries = [
      'First aid basic (3 records)',
      'First aid basic training (2 records)',
      'Basic of first aid (1 record)',
      'First aid basic 101',
    ];

    expectedListEntries.forEach((record) => {
      expect(getByText(record)).toBeTruthy();
    });
  });
});
