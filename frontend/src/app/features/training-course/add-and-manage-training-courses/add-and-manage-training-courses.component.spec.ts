import { getTestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { AddAndManageTrainingCoursesComponent } from './add-and-manage-training-courses.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

fdescribe('AddAndManageTrainingCoursesComponent', () => {
  async function setup() {
    const setupTools = await render(AddAndManageTrainingCoursesComponent, {
      imports: [],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { establishment: { uid: 'mock-uid' } },
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
});
