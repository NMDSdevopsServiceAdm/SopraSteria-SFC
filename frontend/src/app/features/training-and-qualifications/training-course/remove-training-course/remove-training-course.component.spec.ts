import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { render } from '@testing-library/angular';

import { RemoveTrainingCourseComponent } from './remove-training-course.component';
import userEvent from '@testing-library/user-event';

describe('RemoveTrainingCourseComponent', () => {
  const mockTrainingCourses = [
    { uid: 'course-1', name: 'Health and safety awareness' },
    { uid: 'course-2', name: 'Fire safety' },
    { uid: 'course-3', name: 'Medication management' },
  ];

  const mockEstablishmentUid = 'est-1';

  async function setup(overrides: any = {}) {
    const journeyType = overrides?.journeyType ?? 'RemoveSingle';
    const selectedTrainingCourseUid = journeyType === 'RemoveSingle' ? mockTrainingCourses[0].uid : undefined;

    const setupTools = await render(RemoveTrainingCourseComponent, {
      imports: [RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: { uid: mockEstablishmentUid, name: 'Test Workplace' },
                },
              },
            },
            snapshot: {
              data: {
                trainingCourses: mockTrainingCourses,
                journeyType,
              },
              params: { establishmentuid: mockEstablishmentUid, trainingCourseUid: selectedTrainingCourseUid },
            },
          },
        },
        { provide: AlertService, useValue: { addAlert: () => {} } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const route = injector.inject(ActivatedRoute);

    const alertService = injector.inject(AlertService);
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const trainingCourseService = injector.inject(TrainingCourseService) as TrainingCourseService;
    spyOn(trainingCourseService, 'deleteTrainingCourse').and.returnValue(of(null));
    spyOn(trainingCourseService, 'deleteAllTrainingCourses').and.returnValue(of(null));

    return {
      ...setupTools,
      component,
      route,
      routerSpy,
      alertSpy,
      trainingCourseServiceSpy: trainingCourseService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the caption for the page', async () => {
    const { getByText } = await setup();

    expect(getByText('Add and update training courses')).toBeTruthy();
  });

  describe('when removing one training course', () => {
    it('should show the correct heading referencing a single training course', async () => {
      const { getByRole } = await setup();

      const expectedHeadingText = 'What happens when you remove a training course?';
      expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
    });

    it('should initialise workplace, trainingCourseUid and trainingName', async () => {
      const { component } = await setup();
      expect(component.workplace.uid).toBe(mockEstablishmentUid);
      expect(component.trainingCourseUid).toBe('course-1');
      expect(component.trainingCourseName).toBe('Health and safety awareness');
    });

    it('should call deleteTrainingCourse and navigate with alert on success', async () => {
      const { getByRole, fixture, trainingCourseServiceSpy, routerSpy, alertSpy, route } = await setup();

      userEvent.click(getByRole('button', { name: 'Remove this training course' }));

      expect(trainingCourseServiceSpy.deleteTrainingCourse).toHaveBeenCalledWith(mockEstablishmentUid, 'course-1');

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith([
        'workplace',
        mockEstablishmentUid,
        'training-course',
        'add-and-manage-training-courses',
      ]);
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Training course removed',
      });
    });
  });

  describe('when removing all training courses', () => {
    it('should show different texts in the page', async () => {
      const { getByRole, getByText } = await setup({ journeyType: 'RemoveAll' });

      const expectedHeadingText = 'What happens when you remove all training courses?';
      expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);

      const expectedConfirmButtonText = 'Remove all training courses';
      expect(getByRole('button', { name: expectedConfirmButtonText })).toBeTruthy();

      const expectedBulletTexts = [
        'keep the details of the removed training courses',
        'still generate alerts when training is due to expire',
      ];

      expectedBulletTexts.forEach((text) => {
        expect(getByText(text)).toBeTruthy();
      });
    });

    it('should list all the training courses in the workplace', async () => {
      const { getByText } = await setup({ journeyType: 'RemoveAll' });

      mockTrainingCourses.forEach((course) => {
        expect(getByText(course.name)).toBeTruthy();
      });
    });

    it('should call deleteAllTrainingCourse and navigate with alert on success', async () => {
      const { getByRole, fixture, trainingCourseServiceSpy, routerSpy, alertSpy, route } = await setup({
        journeyType: 'RemoveAll',
      });

      userEvent.click(getByRole('button', { name: 'Remove all training courses' }));

      expect(trainingCourseServiceSpy.deleteAllTrainingCourses).toHaveBeenCalledWith(mockEstablishmentUid);

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith([
        'workplace',
        mockEstablishmentUid,
        'training-course',
        'add-and-manage-training-courses',
      ]);
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Training courses removed',
      });
    });
  });

  it('should navigate to add-and-manage-training-courses page when clicked Cancel', async () => {
    const { getByRole, routerSpy } = await setup();

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(routerSpy).toHaveBeenCalledWith([
      'workplace',
      mockEstablishmentUid,
      'training-course',
      'add-and-manage-training-courses',
    ]);
  });
});
