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
import { MockTrainingCourseService, trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SelectWhichTrainingRecordsToApplyComponent } from './select-which-training-records-to-apply.component';
import userEvent from '@testing-library/user-event';

describe('SelectWhichTrainingRecordsToApplyComponent', () => {
  const mockEstablishmentUid = 'mock-establishment-uid';
  const mockTrainingCourseUid = 'mock-training-course-uid';
  const radioLabels = {
    ONLY_NEW: 'Only apply the updated course details to NEW training records that you add in the future',
    EXISTING_AND_NEW: 'Apply the updated course details to EXISTING and NEW training records',
  };
  const submitButtonText = 'Apply and save course details';

  async function setup(overrides: any = {}) {
    const trainingCourseToBeUpdated = overrides?.trainingCourseToBeUpdated ?? trainingCourseBuilder();

    const setupTools = await render(SelectWhichTrainingRecordsToApplyComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        WindowRef,
        {
          provide: TrainingCourseService,
          useFactory: MockTrainingCourseService.factory({ trainingCourseToBeUpdated }),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
              params: { establishmentuid: 'mock-establishment-uid', trainingCourseUid: mockTrainingCourseUid },
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
    const updateTrainingCourseSpy = spyOn(trainingCourseService, 'updateTrainingCourse').and.returnValue(of(null));

    const alertService = injector.inject(AlertService);
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      ...setupTools,
      component,
      route,
      routerSpy,
      alertSpy,
      updateTrainingCourseSpy,
      trainingCourseService,
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

  describe('form submit', () => {
    it('should show an error if user submit without choosing an option', async () => {
      const trainingCourseToBeUpdated = trainingCourseBuilder();
      const expectedErrorMessage = 'Select which training records you want the details to apply to';

      const { fixture, getByRole, getByText, getAllByText, updateTrainingCourseSpy } = await setup({
        trainingCourseToBeUpdated,
      });

      userEvent.click(getByRole('button', { name: submitButtonText }));

      fixture.detectChanges();

      expect(getByText('There is a problem')).toBeTruthy;
      expect(getAllByText(expectedErrorMessage)).toHaveSize(2);

      expect(updateTrainingCourseSpy).not.toHaveBeenCalled();
    });

    it('should call updateTrainingCourse() with `applyToExistingRecords: false`, if only new training records should be affected', async () => {
      const trainingCourseToBeUpdated = trainingCourseBuilder();
      const { getByRole, updateTrainingCourseSpy } = await setup({ trainingCourseToBeUpdated });

      userEvent.click(getByRole('radio', { name: radioLabels.ONLY_NEW }));
      userEvent.click(getByRole('button', { name: submitButtonText }));

      expect(updateTrainingCourseSpy).toHaveBeenCalledWith(
        mockEstablishmentUid,
        mockTrainingCourseUid,
        trainingCourseToBeUpdated,
        false,
      );
    });

    it('should call updateTrainingCourse() with `applyToExistingRecords: true`, if existing and new training records should be affected', async () => {
      const trainingCourseToBeUpdated = trainingCourseBuilder();
      const { getByRole, updateTrainingCourseSpy } = await setup({ trainingCourseToBeUpdated });

      userEvent.click(getByRole('radio', { name: radioLabels.EXISTING_AND_NEW }));
      userEvent.click(getByRole('button', { name: submitButtonText }));

      expect(updateTrainingCourseSpy).toHaveBeenCalledWith(
        mockEstablishmentUid,
        mockTrainingCourseUid,
        trainingCourseToBeUpdated,
        true,
      );
    });

    it('should return to "add-and-manage-training-courses" with an alert message after submit', async () => {
      const trainingCourseToBeUpdated = trainingCourseBuilder();
      const { fixture, getByRole, routerSpy, alertSpy, route } = await setup({ trainingCourseToBeUpdated });

      userEvent.click(getByRole('radio', { name: radioLabels.EXISTING_AND_NEW }));
      userEvent.click(getByRole('button', { name: submitButtonText }));

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith(['../../add-and-manage-training-courses'], { relativeTo: route });
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Course details updated and will apply to EXISTING and NEW training records',
      });
    });

    it('should display a different alert message if only apply to existing training records', async () => {
      const trainingCourseToBeUpdated = trainingCourseBuilder();
      const { fixture, getByRole, routerSpy, alertSpy } = await setup({ trainingCourseToBeUpdated });

      userEvent.click(getByRole('radio', { name: radioLabels.ONLY_NEW }));
      userEvent.click(getByRole('button', { name: submitButtonText }));

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Course details updated and will apply to NEW training records',
      });
    });
  });
});
