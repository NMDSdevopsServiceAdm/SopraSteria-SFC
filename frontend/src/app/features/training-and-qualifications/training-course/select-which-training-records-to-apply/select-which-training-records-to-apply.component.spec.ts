import { of } from 'rxjs';

import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { WindowRef } from '@core/services/window.ref';
import { MockTrainingCourseService } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SelectWhichTrainingRecordsToApplyComponent } from './select-which-training-records-to-apply.component';

fdescribe('SelectWhichTrainingRecordsToApplyComponent', () => {
  const mockEstablishmentUid = 'mock-establishment-uid';
  const radioLabels = {
    ONLY_NEW: 'Only apply the updated course details to NEW training records that you add in the future',
    EXISTING_AND_NEW: 'Apply the updated course details to EXISTING and NEW training records',
  };
  const submitButtonText = 'Apply and save course details';

  async function setup(overrides: any = {}) {
    const setupTools = await render(SelectWhichTrainingRecordsToApplyComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        WindowRef,
        {
          provide: TrainingCourseService,
          useFactory: MockTrainingCourseService.factory(),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
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
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);

    const trainingCourseService = injector.inject(TrainingCourseService);
    const createTrainingCourseSpy = spyOn(trainingCourseService, 'createTrainingCourse').and.returnValue(of(null));

    const alertService = injector.inject(AlertService);
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      ...setupTools,
      component,
      routerSpy,
      trainingCourseService,
      createTrainingCourseSpy,
      // alertSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading and caption for the page', async () => {
    const { getByRole, getByText } = await setup();

    const expectedHeadingText = 'Select which training records you want the updated course details to apply to?';
    expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
    expect(getByText('Training and qualifications')).toBeTruthy();
  });

  it('should show radio buttons for the options to choose from', async () => {
    const { getByRole } = await setup();

    expect(getByRole('radio', { name: radioLabels.ONLY_NEW })).toBeTruthy();
    expect(getByRole('radio', { name: radioLabels.EXISTING_AND_NEW })).toBeTruthy();
  });

  it('should show a CTA submit button', async () => {
    const { getByRole } = await setup();

    expect(getByRole('button', { name: submitButtonText })).toBeTruthy();
  });
});
