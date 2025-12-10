import { of } from 'rxjs';

import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { AlertService } from '@core/services/alert.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { WindowRef } from '@core/services/window.ref';
import { MockRouter } from '@core/test-utils/MockRouter';
import { MockTrainingCourseService, trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { YouHaveSelectedTrainingRecords } from './you-have-selected-training-records';

describe('YouHaveSelectedTrainingRecords', () => {
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
    const routerSpy = jasmine.createSpy().and.resolveTo(true);

    const setupTools = await render(YouHaveSelectedTrainingRecords, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        WindowRef,
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
        {
          provide: Router,
          useFactory: MockRouter.factory({
            navigate: routerSpy,
            url: `${mockSelectedTrainingCourse.uid}/confirm-update-records`,
          }),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const route = injector.inject(ActivatedRoute) as ActivatedRoute;
    const trainingCourseService = injector.inject(TrainingCourseService) as TrainingCourseService;
    const trainingCourseServiceSpy = spyOn(
      trainingCourseService,
      'updateTrainingRecordsWithCourseDetails',
    ).and.returnValue(of([]));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert');

    return {
      ...setupTools,
      component,
      route,
      routerSpy,
      trainingCourseService,
      trainingCourseServiceSpy,
      alertSpy,
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

  it('should navigate to "select-a-training-course" page if no training records were selected', async () => {
    const { routerSpy, route } = await setup({ trainingRecordsSelectedForUpdate: [] });

    expect(routerSpy).toHaveBeenCalledWith(['../../select-a-training-course'], { relativeTo: route });
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
      'First aid basic 101 (1 record)',
    ];

    expectedListEntries.forEach((record) => {
      expect(getByText(record)).toBeTruthy();
    });
  });

  it('should show a CTA button and a cancel link', async () => {
    const { getByRole } = await setup();

    expect(getByRole('button', { name: 'Update training records' })).toBeTruthy();
    expect(getByRole('button', { name: 'Cancel' })).toBeTruthy();
  });

  it('the cancel link should link to "select-a-training-course" page', async () => {
    const { getByRole, trainingCourseServiceSpy } = await setup();

    const cancelLink = getByRole('button', { name: 'Cancel' }) as HTMLAnchorElement;
    expect(cancelLink.href).toContain('/select-a-training-course');
    expect(trainingCourseServiceSpy).not.toHaveBeenCalled();
  });

  describe('on submit', () => {
    it('should call updateTrainingRecordsWithCourseDetails() method in service', async () => {
      const { getByRole, trainingCourseServiceSpy } = await setup();

      userEvent.click(getByRole('button', { name: 'Update training records' }));

      expect(trainingCourseServiceSpy).toHaveBeenCalledWith(
        mockEstablishmentUid,
        mockSelectedTrainingCourseUid,
        mocktrainingRecordsSelectedForUpdate,
      );
    });

    it('should navigate to Training and qualification tab and show an alert', async () => {
      const { fixture, getByRole, routerSpy, alertSpy } = await setup();

      userEvent.click(getByRole('button', { name: 'Update training records' }));

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `${mocktrainingRecordsSelectedForUpdate.length} training records updated with course details`,
      });
    });
  });
});
