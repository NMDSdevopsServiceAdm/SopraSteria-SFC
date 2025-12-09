import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { render } from '@testing-library/angular';

import { RemoveTrainingCourseComponent } from './remove-training-course.component';
import { AlertService } from '@core/services/alert.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { MockTrainingCourseService } from '@core/test-utils/MockTrainingCourseService';
import { of } from 'rxjs';

describe('AddAndManageTrainingCoursesComponent', () => {
  const mockTrainingCourses = [
    { uid: 'course-1', name: 'Health and safety awareness' },
    { uid: 'course-2', name: 'Fire safety' },
  ];
  async function setup(overrides: any = {}) {
    const trainingCourseServiceSpy = {
      deleteTrainingCourse: jasmine.createSpy('deleteTrainingCourse').and.returnValue(of(null)),
    };

    const setupTools = await render(RemoveTrainingCourseComponent, {
      imports: [RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: { uid: 'est-1', name: 'Test Workplace' },
                },
              },
            },
            snapshot: {
              data: {
                trainingCourses: mockTrainingCourses,
              },
              paramMap: {
                get: (key: string) => (key === 'trainingCourseUid' ? 'course-1' : null),
              },
            },
          },
        },

        {
          provide: TrainingCourseService,
          useValue: trainingCourseServiceSpy,
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
    const alertService = injector.inject(AlertService);
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      ...setupTools,
      component,
      routerSpy,
      alertSpy,
      trainingCourseServiceSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading and caption for the page', async () => {
    const { getByRole, getByText } = await setup();

    const expectedHeadingText = 'What happens when you remove a training course';
    expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
    expect(getByText('Training and qualifications')).toBeTruthy();
  });

  it('should initialise workplace, trainingCourseUid and trainingName', async () => {
    const { component } = await setup();
    expect(component.workplace.uid).toBe('est-1');
    expect(component.trainingCourseUid).toBe('course-1');
    expect(component.trainingName).toBe('Health and safety awareness');
  });

  it('should call deleteTrainingCourse and navigate with alert on success', async () => {
    const { component, fixture, trainingCourseServiceSpy, routerSpy, alertSpy } = await setup();

    component.deleteTrainingCourseRecord();

    expect(trainingCourseServiceSpy.deleteTrainingCourse).toHaveBeenCalledWith('est-1', 'course-1');

    await fixture.whenStable();

    expect(routerSpy).toHaveBeenCalledWith(['../../add-and-manage-training-courses'], {
      relativeTo: jasmine.any(Object),
    });
    expect(alertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: 'Training course removed',
    });
  });

  it('should navigate back when cancel is clicked', async () => {
    const { component, routerSpy } = await setup();

    const event = { preventDefault: jasmine.createSpy() } as any;
    component.onCancel(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['../../add-and-manage-training-courses'], {
      relativeTo: jasmine.any(Object),
    });
  });
});
