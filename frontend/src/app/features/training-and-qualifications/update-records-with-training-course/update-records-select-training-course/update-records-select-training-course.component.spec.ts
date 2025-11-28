import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MockTrainingCourseService, trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { UpdateRecordsSelectTrainingCourseComponent } from './update-records-select-training-course.component';
import { WindowRef } from '@core/services/window.ref';
import { TrainingCourseService } from '@core/services/training-course.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';

describe('UpdateRecordsSelectTrainingCourseComponent', () => {
  const mockEstablishmentUid = 'mock-establishment-uid';

  async function setup(overrides: any = {}) {
    const setupTools = await render(UpdateRecordsSelectTrainingCourseComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: TrainingCourseService,
          useFactory: MockTrainingCourseService.factory({}),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
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
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a heading', async () => {
    const { getByRole } = await setup();

    const expectedHeading = 'Update records with training course details';
    const expectedSubCaption = 'Training and qualifications';

    expect();
  });

  it('should show reveal text to explain why update records with course detail', async () => {
    const { component } = await setup();

    const expectedTitle = 'Why is it a good idea to update records with training course details?';
    const contents = [];
  });

  describe('training courses table', () => {
    it('should show a table of training courses in the workplace', () => {
      const subheading = 'Select a training course to see the records you can update';
    });

    it(
      'should show the training course name as a link, if there are training records that can be linked to the course',
    );

    it('should show the training course name as a plain text, if no training records can be linked to the course');
  });

  it('should show a text to tell user about the alternative way', () => {
    const expectedText = `You can also update training records with training course details by going to
    training and qualifications, clicking on a member of staff and then clicking on the training record that
     you want to update.`;
  });
});
