import { of } from 'rxjs';

import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { AlertService } from '@core/services/alert.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';
import { MockTrainingCourseService, trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TrainingCourseCategoryComponent } from './training-course-category.component';

describe('TrainingCourseCategoryComponent', () => {
  const mockTrainingCourseToBeAdded = {
    name: 'First aid course',
    accredited: YesNoDontKnow.Yes,
    deliveredBy: DeliveredBy.ExternalProvider,
    externalProviderName: 'Care skills academy',
    howWasItDelivered: HowWasItDelivered.FaceToFace,
    doesNotExpire: false,
    validityPeriodInMonth: 24,
  };
  const mockEstablishmentUid = 'mock-establishment-uid';

  async function setup(overrides: any = {}) {
    const newTrainingCourseToBeAdded = overrides?.newTrainingCourseToBeAdded ?? mockTrainingCourseToBeAdded;
    const trainingCourseToBeUpdated = overrides?.trainingCourseToBeUpdated ?? undefined;
    const journeyType = overrides?.journeyType ?? 'Add';

    const setupTools = await render(TrainingCourseCategoryComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: TrainingCourseService,
          useFactory: MockTrainingCourseService.factory({ newTrainingCourseToBeAdded, trainingCourseToBeUpdated }),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: { uid: mockEstablishmentUid },
                journeyType,
                trainingCategories: trainingCategories,
              },
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
        { provide: AlertService, useValue: { addAlert: () => {} } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const route = injector.inject(ActivatedRoute) as ActivatedRoute;

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
      route,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('when adding a training course', () => {
    it('should show a heading for the page', async () => {
      const { getByRole, getByText } = await setup();

      const expectedHeadingText = 'Select a category that best matches this training course';
      expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
      expect(getByText('Add a training course')).toBeTruthy();
    });

    it('should show the training course name and a "Change" link to return to details page', async () => {
      const { getByText } = await setup();

      expect(getByText('Training course name')).toBeTruthy();
      expect(getByText(mockTrainingCourseToBeAdded.name)).toBeTruthy();

      expect(getByText('Change').getAttribute('href')).toEqual('/details');
    });
  });

  describe('when editing a training course', () => {
    it('should show a heading for the page', async () => {
      const mockTrainingCourse = trainingCourseBuilder();
      const { getByRole, getByText } = await setup({
        journeyType: 'Edit',
        trainingCourseToBeUpdated: mockTrainingCourse,
      });

      const expectedHeadingText = 'Select a category that best matches this training course';
      expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
      expect(getByText('Training and qualifications')).toBeTruthy();
    });

    it('should show the training course name and a "Change" link to return to details page', async () => {
      const mockTrainingCourse = trainingCourseBuilder();
      const { getByText } = await setup({ journeyType: 'Edit', trainingCourseToBeUpdated: mockTrainingCourse });

      expect(getByText('Training course name')).toBeTruthy();
      expect(getByText(mockTrainingCourse.name)).toBeTruthy();

      expect(getByText('Change').getAttribute('href')).toEqual('/details');
    });

    it('should prefill the category of the training course', async () => {
      const mockTrainingCourse = trainingCourseBuilder();
      const { getByRole, component } = await setup({
        journeyType: 'Edit',
        trainingCourseToBeUpdated: mockTrainingCourse,
      });

      const radioButton = getByRole('radio', { name: mockTrainingCourse.trainingCategoryName }) as HTMLInputElement;
      expect(radioButton.checked).toBeTruthy();
      expect(component.form.get('category').value).toEqual(mockTrainingCourse.trainingCategoryId);
    });
  });

  it('should show an accordion with the correct categories in', async () => {
    const { component, getByTestId } = await setup();
    expect(component.categories).toEqual([
      { id: 1, seq: 10, category: 'Activity provision/Well-being', trainingCategoryGroup: 'Care skills and knowledge' },
      { id: 2, seq: 20, category: 'Autism', trainingCategoryGroup: 'Specific conditions and disabilities' },
      { id: 37, seq: 1, category: 'Other', trainingCategoryGroup: null },
    ]);
    expect(getByTestId('groupedAccordion')).toBeTruthy();
  });

  it('should display a checkbox for "Others"', async () => {
    const { getByLabelText, getByText } = await setup();

    const othersCheckbox = getByLabelText(
      'The training course does not match with any of these categories',
    ) as HTMLInputElement;

    expect(othersCheckbox).toBeTruthy();

    userEvent.click(othersCheckbox);
    expect(othersCheckbox.checked).toBeTrue();

    userEvent.click(getByText('Show all categories'));
    userEvent.click(getByLabelText(/Activity provision/));

    expect(othersCheckbox.checked).toBeFalse();
  });

  describe('form submit', () => {
    it('should show an error message if user submit without selecting a category', async () => {
      const { fixture, getByRole, getByText, getAllByText, createTrainingCourseSpy } = await setup({
        journeyType: 'Add',
      });
      const expectedErrorMsg = 'Select the training course category';

      userEvent.click(getByRole('button', { name: 'Save training course' }));

      fixture.detectChanges();
      expect(getByText('There is a problem')).toBeTruthy();
      expect(getAllByText(expectedErrorMsg)).toHaveSize(2);
      expect(createTrainingCourseSpy).not.toHaveBeenCalled();
    });

    it('should return to "Add and manage training courses" main page when Cancel button is clicked', async () => {
      const { getByRole } = await setup();

      const cancelButton = getByRole('button', { name: 'Cancel' });
      expect(cancelButton.getAttribute('href')).toEqual(
        '/workplace/mock-establishment-uid/training-course/add-and-manage-training-courses',
      );
    });

    describe('when adding new training course', () => {
      it('should show a "Save training course" button and a "Cancel button"', async () => {
        const { getByRole } = await setup({ journeyType: 'Add' });

        expect(getByRole('button', { name: 'Save training course' })).toBeTruthy();
        expect(getByRole('button', { name: 'Cancel' })).toBeTruthy();
      });

      it('should call createTrainingCourse() with new training course data', async () => {
        const { getByRole, getByLabelText, createTrainingCourseSpy } = await setup({ journeyType: 'Add' });
        userEvent.click(getByLabelText(trainingCategories[0].category));
        userEvent.click(getByRole('button', { name: 'Save training course' }));

        const expectedProps = {
          ...mockTrainingCourseToBeAdded,
          trainingCategoryId: trainingCategories[0].id,
        };
        expect(createTrainingCourseSpy).toHaveBeenCalledWith(mockEstablishmentUid, expectedProps);
      });

      it('should return to "Add and manage training courses" main page with alert', async () => {
        const { fixture, getByRole, getByLabelText, routerSpy, alertSpy } = await setup({ journeyType: 'Add' });
        userEvent.click(getByLabelText(trainingCategories[0].category));
        userEvent.click(getByRole('button', { name: 'Save training course' }));

        await fixture.whenStable();
        expect(routerSpy).toHaveBeenCalledWith([
          'workplace',
          mockEstablishmentUid,
          'training-course',
          'add-and-manage-training-courses',
        ]);
        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Training course added',
        });
      });
    });

    describe('when editing a training course', () => {
      it('should show a "Continue" button instead', async () => {
        const mockTrainingCourse = trainingCourseBuilder();
        const { getByRole } = await setup({
          journeyType: 'Edit',
          trainingCourseToBeUpdated: mockTrainingCourse,
        });

        expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
      });

      it('should update the training course in trainingCourseService', async () => {
        const mockTrainingCourse = trainingCourseBuilder();
        const { getByRole, trainingCourseService, routerSpy, route } = await setup({
          journeyType: 'Edit',
          trainingCourseToBeUpdated: mockTrainingCourse,
        });
        const updateTrainingCourseSpy = spyOnProperty(trainingCourseService, 'trainingCourseToBeUpdated', 'set');

        userEvent.click(getByRole('radio', { name: trainingCategories[1].category }));
        userEvent.click(getByRole('button', { name: 'Continue' }));

        expect(updateTrainingCourseSpy).toHaveBeenCalledWith({
          ...mockTrainingCourse,
          trainingCategoryId: trainingCategories[1].id,
        });
        expect(routerSpy).toHaveBeenCalledWith(['../details'], { relativeTo: route });
      });
    });
  });
});
