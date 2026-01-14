import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MockTrainingCourseService, trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { UpdateRecordsSelectTrainingCourseComponent } from './update-records-select-training-course.component';
import { TrainingCourseService } from '@core/services/training-course.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { TrainingCourseWithLinkableRecords } from '@core/model/training-course.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';

describe('UpdateRecordsSelectTrainingCourseComponent', () => {
  const mockEstablishmentUid = 'mock-establishment-uid';
  const courseWithNoLinkableRecords = { ...trainingCourseBuilder(), linkableTrainingRecords: [] };
  const courseWithLinkableRecords = {
    ...trainingCourseBuilder(),
    linkableTrainingRecords: [
      {
        id: 1,
        uid: 'mock-training-record-uid-1',
        title: 'training record not linked to a course yet',
      },
      {
        id: 2,
        uid: 'mock-training-record-uid-2',
        title: 'another training record not linked to a course yet',
      },
    ],
  };
  const mockTrainingCourses: Array<TrainingCourseWithLinkableRecords> = [
    courseWithNoLinkableRecords,
    courseWithLinkableRecords,
  ];

  async function setup(overrides: any = {}) {
    const trainingCoursesWithLinkableRecords = overrides?.trainingCoursesWithLinkableRecords ?? mockTrainingCourses;
    const showBreadcrumbSpy = jasmine.createSpy('BreadcrumbService.show()');

    const setupTools = await render(UpdateRecordsSelectTrainingCourseComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: BreadcrumbService,
          useValue: { show: showBreadcrumbSpy },
        },
        {
          provide: TrainingCourseService,
          useFactory: MockTrainingCourseService.factory({}),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { trainingCoursesWithLinkableRecords },
              params: { establishmentuid: mockEstablishmentUid },
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
      showBreadcrumbSpy,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a heading and a caption', async () => {
    const { getByRole, getByTestId } = await setup();

    const expectedHeading = 'Select a training course to see the records you can update';
    const expectedCaption = 'Training records';

    expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeading);
    expect(getByTestId('section-heading').textContent).toContain(expectedCaption);
  });

  it('should show a breadcrumb', async () => {
    const { showBreadcrumbSpy } = await setup();
    expect(showBreadcrumbSpy).toHaveBeenCalledWith(JourneyType.UPDATE_RECORDS_WITH_TRAINING_COURSE_DETAILS);
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

  describe('training courses table', () => {
    it('should show a table of training courses in the workplace', async () => {
      const { getByTestId } = await setup();

      const table = getByTestId('training-course-table');
      expect(table).toBeTruthy();
    });

    describe('if a course can be linked to training records', () => {
      it('should show the training course name as a link and "Records available to update" in status column', async () => {
        const { getByText } = await setup();

        const trainingCourseRow = getByText(courseWithLinkableRecords.name).closest('tr');
        const courseNameAsLink = within(trainingCourseRow).queryByRole('link', {
          name: courseWithLinkableRecords.name,
        }) as HTMLLinkElement;
        expect(courseNameAsLink).toBeTruthy();
        expect(courseNameAsLink.href).toContain(`/${courseWithLinkableRecords.uid}/select-training-records`);

        expect(within(trainingCourseRow).queryByText('Records available to update')).toBeTruthy();
      });
    });

    describe('if a course cannot be linked to training records (no training record in that category)', () => {
      it('should show the training course name as plain text and "No records available to update" in status column', async () => {
        const { getByText } = await setup();

        const trainingCourseRow = getByText(courseWithNoLinkableRecords.name).closest('tr');
        const courseNameAsLink = within(trainingCourseRow).queryByRole('link', {
          name: courseWithLinkableRecords.name,
        }) as HTMLLinkElement;
        expect(courseNameAsLink).toBeFalsy();

        const courseNameAsPlainText = within(trainingCourseRow).getByText(courseWithNoLinkableRecords.name);
        expect(courseNameAsPlainText).toBeTruthy();

        expect(within(trainingCourseRow).queryByText('No records available to update')).toBeTruthy();
      });
    });
  });

  it('should show a text to tell user about the alternative way and link to training and qualifications tab', async () => {
    const { getByText } = await setup();

    const expectedText =
      'You can also update training records with training course details by going to ' +
      'training and qualifications, clicking on a member of staff and then clicking ' +
      'on the training record that you want to update.';

    const paragraph = getByText(/^You can also update/);
    expect(paragraph.textContent).toContain(expectedText);

    const link = within(paragraph).getByRole('link') as HTMLAnchorElement;
    expect(link.href).toContain('/dashboard#training-and-qualifications');
  });
});
