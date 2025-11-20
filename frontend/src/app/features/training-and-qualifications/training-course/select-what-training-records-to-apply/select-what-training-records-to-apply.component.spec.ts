import { of } from 'rxjs';

import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { MockTrainingCourseService } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SelectWhatTrainingRecordsToApplyComponent } from './select-what-training-records-to-apply.component';

describe('SelectWhatTrainingRecordsToApplyComponent', () => {
  const mockEstablishmentUid = 'mock-establishment-uid';

  async function setup(overrides: any = {}) {
    const setupTools = await render(SelectWhatTrainingRecordsToApplyComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
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
      alertSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
