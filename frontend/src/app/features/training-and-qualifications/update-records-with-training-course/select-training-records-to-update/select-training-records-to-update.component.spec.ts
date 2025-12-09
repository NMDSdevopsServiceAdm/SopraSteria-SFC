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
import userEvent from '@testing-library/user-event';
import { BackLinkService } from '@core/services/backLink.service';

describe('SelectTrainingRecordsToUpdateComponent', () => {
  const mockEstablishmentUid = 'mock-establishment-uid';
  const mockLinkableTrainingRecords = [
    trainingRecordBuilder({ overrides: { title: 'training A' } }),
    trainingRecordBuilder({ overrides: { title: 'training B' } }),
    trainingRecordBuilder({ overrides: { title: 'training A' } }),
    trainingRecordBuilder({ overrides: { title: 'training A' } }),
    trainingRecordBuilder({ overrides: { title: 'training C' } }),
    trainingRecordBuilder({ overrides: { title: 'training B' } }),
  ];
  const showBackLinkSpy = jasmine.createSpy('showBacklink').and.returnValue(undefined);

  const mockSelectedTrainingCourse = {
    ...trainingCourseBuilder(),
    linkableTrainingRecords: mockLinkableTrainingRecords,
  };

  async function setup(overrides: any = {}) {
    const selectedTrainingCourse = overrides?.selectedTrainingCourse ?? mockSelectedTrainingCourse;
    const trainingCoursesWithLinkableRecords: Array<TrainingCourse> = [
      trainingCourseBuilder(),
      selectedTrainingCourse,
      trainingCourseBuilder(),
    ];
    const trainingRecordsSelectedForUpdate = overrides?.trainingRecordsSelectedForUpdate ?? null;

    const setupTools = await render(SelectTrainingRecordsToUpdateComponent, {
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
              params: { establishmentuid: mockEstablishmentUid, trainingCourseUid: selectedTrainingCourse.uid },
              root: { children: [], url: [''] },
            },
          },
        },
        { provide: BackLinkService, useValue: { showBackLink: showBackLinkSpy } },
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
      showBackLinkSpy,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a backlink', async () => {
    const { showBackLinkSpy } = await setup();
    expect(showBackLinkSpy).toHaveBeenCalled();
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

  describe('checkboxes', () => {
    it('should show checkboxes of training records to select, with the records of same title grouped together', async () => {
      const { getByRole } = await setup();

      expect(getByRole('checkbox', { name: 'training A (3 records)' })).toBeTruthy();
      expect(getByRole('checkbox', { name: 'training B (2 records)' })).toBeTruthy();
      expect(getByRole('checkbox', { name: 'training C (1 record)' })).toBeTruthy();
    });

    it('should prefill the checkboxes from previously selection', async () => {
      const trainingRecordsSelectedForUpdate = mockLinkableTrainingRecords.filter(
        (record) => record.title === 'training B' || record.title === 'training C',
      );

      const { getByRole } = await setup({ trainingRecordsSelectedForUpdate });
      const getCheckboxByLabel = (label) => getByRole('checkbox', { name: label }) as HTMLInputElement;

      expect(getCheckboxByLabel(/training A/).checked).toBeFalse();
      expect(getCheckboxByLabel(/training B/).checked).toBeTrue();
      expect(getCheckboxByLabel(/training C/).checked).toBeTrue();
    });

    it('should be able to handle training records with name missing', async () => {
      const mockLinkableTrainingRecords = [
        trainingRecordBuilder({ overrides: { title: null } }),
        trainingRecordBuilder({ overrides: { title: '' } }),
        trainingRecordBuilder({ overrides: { title: null } }),
        trainingRecordBuilder({ overrides: { title: 'training A' } }),
      ];
      const selectedTrainingCourse = {
        ...trainingCourseBuilder(),
        linkableTrainingRecords: mockLinkableTrainingRecords,
      };
      const { getByRole } = await setup({ selectedTrainingCourse });

      expect(getByRole('checkbox', { name: 'training A (1 record)' })).toBeTruthy();
      expect(getByRole('checkbox', { name: 'Missing training name (3 records)' })).toBeTruthy();
    });
  });

  it('should show a Continue button and a cancel link', async () => {
    const { getByRole } = await setup();

    expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
    expect(getByRole('button', { name: 'Cancel' })).toBeTruthy();
  });

  describe('form submit', () => {
    it('should store selected training records to service and navigate to the next page', async () => {
      const { getByRole, routerSpy, trainingCourseService, route } = await setup();
      const trainingCourseServiceSpy = spyOnProperty(trainingCourseService, 'trainingRecordsSelectedForUpdate', 'set');

      userEvent.click(getByRole('checkbox', { name: /training A/ }));
      userEvent.click(getByRole('checkbox', { name: /training C/ }));
      userEvent.click(getByRole('button', { name: 'Continue' }));

      const trainingRecordsChosen = mockLinkableTrainingRecords.filter(
        (record) => record.title === 'training A' || record.title === 'training C',
      );

      expect(trainingCourseServiceSpy).toHaveBeenCalledWith(trainingRecordsChosen);
      expect(routerSpy).toHaveBeenCalledWith(['../confirm-update-records'], { relativeTo: route });
    });

    it('should navigate to select-a-training-course page if user clicked Continue without selecting any of the checkboxes', async () => {
      const { getByRole, routerSpy, trainingCourseService, route } = await setup();
      const trainingCourseServiceSpy = spyOnProperty(trainingCourseService, 'trainingRecordsSelectedForUpdate', 'set');

      userEvent.click(getByRole('button', { name: 'Continue' }));

      expect(trainingCourseServiceSpy).not.toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['../../select-a-training-course'], { relativeTo: route });
    });

    it('should return to select-a-training-course page if user clicked Cancel', async () => {
      const { getByRole } = await setup();

      const cancelLink = getByRole('button', { name: 'Cancel' }) as HTMLAnchorElement;
      expect(cancelLink.href).toContain('/select-a-training-course');
    });
  });
});
