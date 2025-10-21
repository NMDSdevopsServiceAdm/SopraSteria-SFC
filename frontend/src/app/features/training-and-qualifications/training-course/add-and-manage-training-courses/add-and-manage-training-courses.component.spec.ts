import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { render, within } from '@testing-library/angular';

import { AddAndManageTrainingCoursesComponent } from './add-and-manage-training-courses.component';

describe('AddAndManageTrainingCoursesComponent', () => {
  async function setup(overrides: any = {}) {
    const trainingCourses = overrides?.trainingCourses ?? [];

    const setupTools = await render(AddAndManageTrainingCoursesComponent, {
      imports: [RouterModule],
      providers: [
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { establishment: { uid: 'mock-uid' }, trainingCourses },
              root: { children: [], url: [''] },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      routerSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a heading for the page', async () => {
    const { getByRole, getByText } = await setup();

    const expectedHeadingText = 'Add and manage training courses for your workplace';
    expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
    expect(getByText('Training and qualifications')).toBeTruthy();
  });

  it('should show CTA button to add a training course', async () => {
    const { getByRole } = await setup();

    expect(getByRole('button', { name: 'Add a training course' })).toBeTruthy();
  });

  describe('training course table', () => {
    it('should not show the table if workplace dont have any training courses', async () => {
      const { queryByTestId } = await setup({ trainingCourses: [] });
      const trainingCourseTable = queryByTestId('training-course-table');

      expect(trainingCourseTable).toBeFalsy();
    });

    it('should show a row for each training course, which contains the links to modify or delete the course', async () => {
      const mockTrainingCourses = [trainingCourseBuilder(), trainingCourseBuilder(), trainingCourseBuilder()];
      const { queryByTestId } = await setup({ trainingCourses: mockTrainingCourses });
      const trainingCourseTable = queryByTestId('training-course-table');

      expect(trainingCourseTable).toBeTruthy();

      mockTrainingCourses.forEach((course, index) => {
        const row = queryByTestId(`trainingCourse-${index}`);
        const courseLink = within(row).getByRole('link', { name: course.name });
        expect(courseLink).toBeTruthy();
        expect(courseLink.getAttribute('href')).toEqual(`/${course.uid}/edit`);

        const removeLink = within(row).getByText('Remove');
        expect(removeLink).toBeTruthy();
        expect(removeLink.getAttribute('href')).toEqual(`/${course.uid}/remove`);
      });
    });

    it('should show the link to training courseas "Missing training course name" if the course name is empty', async () => {
      const mockTrainingCoursesEmptyNames = [
        trainingCourseBuilder({ overrides: { name: null } }),
        trainingCourseBuilder({ overrides: { name: '' } }),
      ];

      const { queryByTestId } = await setup({ trainingCourses: mockTrainingCoursesEmptyNames });
      const trainingCourseTable = queryByTestId('training-course-table');

      expect(trainingCourseTable).toBeTruthy();

      mockTrainingCoursesEmptyNames.forEach((course, index) => {
        const row = queryByTestId(`trainingCourse-${index}`);
        const courseLink = within(row).getByRole('link', { name: 'Missing training course name' });
        expect(courseLink).toBeTruthy();
        expect(courseLink.getAttribute('href')).toEqual(`/${course.uid}/edit`);
      });
    });
  });
});
