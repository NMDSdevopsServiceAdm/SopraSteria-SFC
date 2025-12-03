import lodash from 'lodash';

import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { DeliveredBy } from '@core/model/training.model';
import { TrainingCourseService } from '@core/services/training-course.service';
import { MockTrainingCourseService, trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TrainingCourseDetailsComponent } from './training-course-details.component';
import { trainingCategories as mockTrainingCategories } from '@core/test-utils/MockTrainingCategoriesService';

describe('TrainingCourseDetailsComponent', () => {
  const otherTrainingProviderId = 63;
  const mockTrainingProviders = [
    { id: 1, name: 'Preset provider name #1', isOther: false },
    { id: 63, name: 'other', isOther: true },
  ];

  async function setup(overrides: any = {}) {
    const newTrainingCourseToBeAdded = overrides?.newTrainingCourseToBeAdded;
    const journeyType = overrides?.journeyType ?? 'Add';
    const selectedTrainingCourse = overrides?.selectedTrainingCourse ?? trainingCourseBuilder();
    const trainingCourses = [trainingCourseBuilder(), selectedTrainingCourse, trainingCourseBuilder()];
    const trainingCourseToBeUpdated = overrides?.trainingCourseToBeUpdated ?? undefined;
    const trainingCourseUid = journeyType === 'Edit' ? selectedTrainingCourse.uid : null;

    const setupTools = await render(TrainingCourseDetailsComponent, {
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
                establishment: { uid: 'mock-uid' },
                journeyType,
                trainingCourses,
                trainingProviders: mockTrainingProviders,
                trainingCategories: mockTrainingCategories,
              },
              params: { establishmentuid: 'mock-establishment-uid', trainingCourseUid: trainingCourseUid },
              root: { children: [], url: [''] },
            },
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: 'mock-establishment-uid',
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
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const route = injector.inject(ActivatedRoute) as ActivatedRoute;

    const trainingCourseService = injector.inject(TrainingCourseService);
    const newTrainingCourseToBeAddedSpy = spyOnProperty(trainingCourseService, 'newTrainingCourseToBeAdded', 'set');
    const trainingCourseToBeUpdatedSpy = spyOnProperty(trainingCourseService, 'trainingCourseToBeUpdated', 'set');
    const trainingCourseServiceSpy =
      journeyType === 'Add' ? newTrainingCourseToBeAddedSpy : trainingCourseToBeUpdatedSpy;

    const getInputByLabelText = (label: any) => setupTools.getByLabelText(label) as HTMLInputElement;
    const getInputByRole = (role: any, options: any) => setupTools.getByRole(role, options) as HTMLInputElement;

    return {
      ...setupTools,
      getInputByLabelText,
      getInputByRole,
      component,
      routerSpy,
      route,
      trainingCourseService,
      newTrainingCourseToBeAddedSpy,
      trainingCourseToBeUpdatedSpy,
      trainingCourseServiceSpy,
      selectedTrainingCourse,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('page rendering', () => {
    describe('when adding a training course', () => {
      it('should show a heading for the page', async () => {
        const { getByRole, getByText } = await setup({ journeyType: 'Add' });

        const expectedHeadingText = 'Add training course details';
        expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
        expect(getByText('Add a training course')).toBeTruthy();
      });
    });

    describe('when editing a training course', () => {
      it('should show a heading for the page', async () => {
        const { getByRole, getByText } = await setup({ journeyType: 'Edit' });

        const expectedHeadingText = 'Training course details';
        expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
        expect(getByText('Training and qualifications')).toBeTruthy();
      });

      it('should show the training category of the selected course', async () => {
        const { getByTestId, selectedTrainingCourse } = await setup({ journeyType: 'Edit' });

        const categorySection = getByTestId('training-category');
        expect(categorySection).toBeTruthy();

        expect(within(categorySection).getByText('Training category')).toBeTruthy();
        expect(within(categorySection).getByText(selectedTrainingCourse.trainingCategoryName)).toBeTruthy();
      });

      it('should show the changed category name if user is back from change-category page', async () => {
        const mockTrainingCourse = trainingCourseBuilder();
        const { getByTestId } = await setup({
          journeyType: 'Edit',
          selectedTrainingCourse: mockTrainingCourse,
          trainingCourseToBeUpdated: { ...mockTrainingCourse, trainingCategoryId: mockTrainingCategories[1].id },
        });

        const categorySection = getByTestId('training-category');

        expect(within(categorySection).getByText('Training category')).toBeTruthy();
        expect(within(categorySection).getByText(mockTrainingCategories[1].category)).toBeTruthy();
      });

      it('should show a change link that lead to change category page', async () => {
        const { getByTestId } = await setup({ journeyType: 'Edit' });

        const categorySection = getByTestId('training-category');
        const changeLink = within(categorySection).getByRole('link', { name: /Change/ });
        expect(changeLink).toBeTruthy();
      });

      it('should store the training course name and bring user to category page when change link is clicked', async () => {
        const { getByTestId, getInputByLabelText, trainingCourseToBeUpdatedSpy, routerSpy, route } = await setup({
          journeyType: 'Edit',
        });

        const categorySection = getByTestId('training-category');
        const changeLink = within(categorySection).getByRole('link', { name: /Change/ });

        const courseNameInput = getInputByLabelText('Training course name');

        userEvent.clear(courseNameInput);
        userEvent.type(courseNameInput, 'changed course name');

        userEvent.click(changeLink);
        expect(routerSpy).toHaveBeenCalledWith(['../change-category'], { relativeTo: route });
        expect(trainingCourseToBeUpdatedSpy).toHaveBeenCalledWith(
          jasmine.objectContaining({ name: 'changed course name' }),
        );
      });
    });
  });

  describe('prefill', () => {
    const mockTrainingCourse = {
      ...trainingCourseBuilder(),
      trainingProvider: { id: 1, name: 'Care skills academy', isOther: false },
      trainingProviderId: 1,
      trainingProviderName: 'Care skills academy',
      otherTrainingProviderName: null,
      howWasItDelivered: 'E-learning',
      doesNotExpire: false,
      validityPeriodInMonth: 24,
    };

    describe('when adding new training course', () => {
      // for the case when user return from select category page to this page
      it('should prefill the form with data from TrainingCourseService.newTrainingCourseToBeAdded', async () => {
        const { getInputByRole, getInputByLabelText } = await setup({
          journeyType: 'Add',
          newTrainingCourseToBeAdded: mockTrainingCourse,
        });

        expect(getInputByLabelText('Training course name').value).toEqual(mockTrainingCourse.name);
        expect(getInputByRole('radio', { name: mockTrainingCourse.accredited }).checked).toBeTrue();
        expect(getInputByRole('radio', { name: mockTrainingCourse.deliveredBy }).checked).toBeTrue();
        expect(getInputByLabelText('Provider name').value).toEqual(mockTrainingCourse.trainingProvider.name);
        expect(getInputByRole('radio', { name: 'E-learning' }).checked).toBeTrue();
        expect(getInputByLabelText(/How many months is/).value).toEqual('24');
        expect(getInputByRole('checkbox', { name: 'This training does not expire' }).checked).toBeFalse();
      });
    });

    describe('when editing training course', () => {
      it('should prefill the form with the data of the selected training course', async () => {
        const { getInputByRole, getInputByLabelText } = await setup({
          journeyType: 'Edit',
          selectedTrainingCourse: mockTrainingCourse,
        });

        expect(getInputByLabelText('Training course name').value).toEqual(mockTrainingCourse.name);
        expect(getInputByRole('radio', { name: mockTrainingCourse.accredited }).checked).toBeTrue();
        expect(getInputByRole('radio', { name: mockTrainingCourse.deliveredBy }).checked).toBeTrue();
        expect(getInputByLabelText('Provider name').value).toEqual(mockTrainingCourse.trainingProvider.name);
        expect(getInputByRole('radio', { name: mockTrainingCourse.howWasItDelivered }).checked).toBeTrue();
        expect(getInputByLabelText(/How many months is/).value).toEqual('24');
        expect(getInputByRole('checkbox', { name: 'This training does not expire' }).checked).toBeFalse();
      });
    });

    const mockTrainingCourse2 = {
      name: 'Fire safety course',
      accredited: 'Yes',
      deliveredBy: 'External provider',
      trainingProvider: { id: 63, name: 'Others', isOther: true },
      otherTrainingProviderName: 'Some other training',
      howWasItDelivered: 'Face to face',
      doesNotExpire: true,
      validityPeriodInMonth: null,
    };

    it('should be able to prefill correctly when "otherTrainingProviderName" is given', async () => {
      const { getInputByLabelText } = await setup({
        journeyType: 'Add',
        newTrainingCourseToBeAdded: mockTrainingCourse2,
      });

      expect(getInputByLabelText('Provider name').value).toEqual(mockTrainingCourse2.otherTrainingProviderName);
    });

    it('should be able to prefill correctly when "does not expire" is true', async () => {
      const { getInputByRole, getInputByLabelText } = await setup({
        journeyType: 'Add',
        newTrainingCourseToBeAdded: mockTrainingCourse2,
      });

      expect(getInputByLabelText(/How many months is/).value).toEqual('');
      expect(getInputByRole('checkbox', { name: 'This training does not expire' }).checked).toBeTrue();
    });
  });

  describe('input form', () => {
    it('should show a text input for provider name iff user select "External provider" for delivered by external provider', async () => {
      const { getByRole, fixture } = await setup();

      const providerName = getByRole('textbox', { name: 'Provider name' });
      expect(providerName).toBeTruthy();
      const providerNameWrapper = providerName.parentElement;
      expect(providerNameWrapper).toHaveClass('govuk-radios__conditional--hidden');

      userEvent.click(getByRole('radio', { name: DeliveredBy.ExternalProvider }));
      fixture.detectChanges();
      expect(providerNameWrapper).not.toHaveClass('govuk-radios__conditional--hidden');

      userEvent.click(getByRole('radio', { name: DeliveredBy.InHouseStaff }));
      fixture.detectChanges();
      expect(providerNameWrapper).toHaveClass('govuk-radios__conditional--hidden');
    });

    it('should clear the doesNotExpire checkbox when user change validityPeriodInMonth by button', async () => {
      const { getInputByRole, getByTestId, fixture } = await setup();

      const doesNotExpireCheckbox = getInputByRole('checkbox', { name: 'This training does not expire' });
      doesNotExpireCheckbox.click();
      expect(doesNotExpireCheckbox.checked).toBeTrue();

      getByTestId('plus-button-validity-period').click();
      fixture.detectChanges();

      expect(doesNotExpireCheckbox.checked).toBeFalse();
    });

    it('should clear the doesNotExpire checkbox when user change validityPeriodInMonth by typing value', async () => {
      const { getInputByRole, fixture } = await setup();

      const validityPeriodInMonth = getInputByRole('textbox', {
        name: 'How many months is the training valid for before it expires?',
      });
      const doesNotExpireCheckbox = getInputByRole('checkbox', { name: 'This training does not expire' });

      userEvent.type(validityPeriodInMonth, '12');
      fixture.detectChanges();

      expect(doesNotExpireCheckbox.checked).toBeFalse();
    });

    it('should clear any value in validityPeriodInMonth when doesNotExpire checkbox is ticked', async () => {
      const { getInputByRole, getByTestId, fixture } = await setup();

      const validityPeriodInMonth = getInputByRole('textbox', {
        name: 'How many months is the training valid for before it expires?',
      });
      const doesNotExpireCheckbox = getInputByRole('checkbox', { name: 'This training does not expire' });

      getByTestId('plus-button-validity-period').click();
      fixture.detectChanges();
      expect(validityPeriodInMonth.value).toEqual('1');

      doesNotExpireCheckbox.click();
      fixture.detectChanges();

      expect(validityPeriodInMonth.value).toEqual('');
    });

    describe('validations', () => {
      it('should show an error message on submit if training course name is empty', async () => {
        const { getByRole, fixture, getByText, getByLabelText, getAllByText, trainingCourseServiceSpy } = await setup();
        const expectedErrorMsg = 'Enter the training course name';

        userEvent.type(getByLabelText(/^How many months/), '24');
        userEvent.click(getByRole('button', { name: 'Continue' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText(expectedErrorMsg)).toHaveSize(2);
        expect(trainingCourseServiceSpy).not.toHaveBeenCalled();
      });

      it('should show an error message on submit if training course name is less then 3 characters', async () => {
        const { getByRole, fixture, getByText, getByLabelText, getAllByText, trainingCourseServiceSpy } = await setup();
        const expectedErrorMsg = 'Training course name must be between 3 and 120 characters';

        userEvent.type(getByLabelText('Training course name'), 'a');
        userEvent.click(getByRole('button', { name: 'Continue' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText(expectedErrorMsg)).toHaveSize(2);
        expect(trainingCourseServiceSpy).not.toHaveBeenCalled();
      });

      it('should show an error message on submit if training course name is more then 120 characters', async () => {
        const { getByRole, fixture, getByText, getByLabelText, getAllByText, trainingCourseServiceSpy } = await setup();
        const expectedErrorMsg = 'Training course name must be between 3 and 120 characters';

        userEvent.type(getByLabelText('Training course name'), lodash.repeat('a', 121));
        userEvent.click(getByRole('button', { name: 'Continue' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText(expectedErrorMsg)).toHaveSize(2);
        expect(trainingCourseServiceSpy).not.toHaveBeenCalled();
      });

      it('should show an error message on submit if validityPeriodInMonth and doesNotExpire are both empty', async () => {
        const { getByRole, fixture, getByText, getByLabelText, getAllByText, trainingCourseServiceSpy } = await setup();
        const expectedErrorMsg1 = 'Enter the number of months';
        const expectedErrorMsg2 = 'Confirm the training does not expire';

        userEvent.type(getByLabelText('Training course name'), 'First aid course');
        userEvent.click(getByRole('button', { name: 'Continue' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText(expectedErrorMsg1)).toHaveSize(2);
        expect(getAllByText(expectedErrorMsg2)).toHaveSize(2);
        expect(trainingCourseServiceSpy).not.toHaveBeenCalled();
      });

      const invalidValuesForTesting = ['-10', '0', '99999', 'apple', '   '];

      invalidValuesForTesting.forEach((invalidValue) => {
        it(`should show an error message if validityPeriodInMonth got an invalid value - ${invalidValue}`, async () => {
          const { getByRole, fixture, getByText, getByLabelText, getAllByText, trainingCourseServiceSpy } =
            await setup();
          const expectedErrorMsg1 = 'Number of months must be between 1 and 999';
          const expectedErrorMsg2 = 'Confirm the training does not expire';

          userEvent.type(getByLabelText('Training course name'), 'First aid course');
          userEvent.type(getByLabelText(/^How many months/), invalidValue);
          userEvent.click(getByRole('button', { name: 'Continue' }));
          fixture.detectChanges();

          expect(getByText('There is a problem')).toBeTruthy();
          expect(getAllByText(expectedErrorMsg1)).toHaveSize(2);
          expect(getAllByText(expectedErrorMsg2)).toHaveSize(2);
          expect(trainingCourseServiceSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('form submit', () => {
    ['Add', 'Edit'].forEach((journeyType) => {
      describe(`common logic - ${journeyType}:`, () => {
        it('should show a Continue button and a Cancel button', async () => {
          const { getByRole } = await setup({ journeyType });

          expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
          expect(getByRole('button', { name: 'Cancel' })).toBeTruthy();
        });

        it('the cancel button should link to the "Add and manage training course" page', async () => {
          const { getByRole } = await setup({ journeyType: 'Add' });

          const cancelButton = getByRole('button', { name: 'Cancel' });
          expect(cancelButton.getAttribute('href')).toEqual(
            '/workplace/mock-establishment-uid/training-course/add-and-manage-training-courses',
          );
        });

        it('should set trainingProviderId and otherTrainingProviderName to null on submit, if user select deliveredBy as In-house staff', async () => {
          const { getByRole, getByLabelText, trainingCourseServiceSpy } = await setup({ journeyType });

          userEvent.type(getByLabelText('Training course name'), 'First aid course');
          userEvent.type(getByLabelText(/How many months/), '24');

          userEvent.click(getByRole('radio', { name: 'In-house staff' }));

          userEvent.click(getByRole('button', { name: 'Continue' }));

          expect(trainingCourseServiceSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({
              deliveredBy: 'In-house staff',
              otherTrainingProviderName: null,
              trainingProviderId: null,
            }),
          );
        });

        it('should set trainingProviderId to a preset id, if user entered one of the preset training provider name', async () => {
          const { getByRole, getByLabelText, trainingCourseServiceSpy } = await setup({ journeyType });

          userEvent.type(getByLabelText('Training course name'), 'First aid course');
          userEvent.type(getByLabelText(/How many months/), '24');

          userEvent.click(getByRole('radio', { name: 'External provider' }));
          userEvent.clear(getByLabelText('Provider name'));
          userEvent.type(getByLabelText('Provider name'), mockTrainingProviders[0].name);

          userEvent.click(getByRole('button', { name: 'Continue' }));

          expect(trainingCourseServiceSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({
              deliveredBy: 'External provider',
              otherTrainingProviderName: null,
              trainingProviderId: mockTrainingProviders[0].id,
            }),
          );
        });

        it('should set trainingProviderId to the id of "other" and set the otherTrainingProviderName, if user entered a name that is not in the list', async () => {
          const { getByRole, getByLabelText, trainingCourseServiceSpy } = await setup({ journeyType });

          userEvent.type(getByLabelText('Training course name'), 'First aid course');
          userEvent.type(getByLabelText(/How many months/), '24');

          userEvent.click(getByRole('radio', { name: 'External provider' }));
          userEvent.clear(getByLabelText('Provider name'));
          userEvent.type(getByLabelText('Provider name'), 'A new training provider');

          userEvent.click(getByRole('button', { name: 'Continue' }));

          expect(trainingCourseServiceSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({
              deliveredBy: 'External provider',
              otherTrainingProviderName: 'A new training provider',
              trainingProviderId: otherTrainingProviderId,
            }),
          );
        });
      });
    });

    describe('when adding new training course', () => {
      it('should save the current training course in trainingCourseService, and navigate to select category page', async () => {
        const { getByRole, getByLabelText, newTrainingCourseToBeAddedSpy, routerSpy, route } = await setup({
          journeyType: 'Add',
        });

        userEvent.type(getByLabelText('Training course name'), 'First aid course');
        userEvent.click(getByLabelText('Yes'));
        userEvent.click(getByLabelText('External provider'));
        userEvent.type(getByLabelText('Provider name'), 'Care skill academy');
        userEvent.click(getByLabelText('Face to face'));
        userEvent.type(getByLabelText(/^How many months/), '24');

        userEvent.click(getByRole('button', { name: 'Continue' }));

        const expectedProps = {
          name: 'First aid course',
          accredited: 'Yes',
          deliveredBy: 'External provider',
          trainingProviderId: otherTrainingProviderId,
          otherTrainingProviderName: 'Care skill academy',
          howWasItDelivered: 'Face to face',
          validityPeriodInMonth: 24,
          doesNotExpire: null,
        } as Partial<TrainingCourse>;

        expect(newTrainingCourseToBeAddedSpy).toHaveBeenCalledWith(expectedProps);
        expect(routerSpy).toHaveBeenCalledWith(['../select-category'], { relativeTo: route });
      });
    });

    describe('when editing training course', () => {
      it('should save the changed training course in trainingCourseService, and navigate to select-which-training-records-to-apply page', async () => {
        const { getByLabelText, getByRole, selectedTrainingCourse, trainingCourseToBeUpdatedSpy, routerSpy, route } =
          await setup({
            journeyType: 'Edit',
          });

        expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
        expect(getByRole('button', { name: 'Cancel' })).toBeTruthy();

        userEvent.clear(getByLabelText('Training course name'));
        userEvent.type(getByLabelText('Training course name'), 'First aid course');

        userEvent.click(getByLabelText('Yes'));
        userEvent.click(getByLabelText('External provider'));

        userEvent.clear(getByLabelText('Provider name'));
        userEvent.type(getByLabelText('Provider name'), 'Care skill academy');

        userEvent.click(getByLabelText('Face to face'));
        userEvent.type(getByLabelText(/^How many months/), '24');

        userEvent.click(getByRole('button', { name: 'Continue' }));

        const expectedProps = {
          name: 'First aid course',
          accredited: 'Yes',
          trainingCategoryId: selectedTrainingCourse.trainingCategoryId,
          deliveredBy: 'External provider',
          trainingProviderId: otherTrainingProviderId,
          otherTrainingProviderName: 'Care skill academy',
          howWasItDelivered: 'Face to face',
          validityPeriodInMonth: 24,
          doesNotExpire: null,
        } as Partial<TrainingCourse>;

        expect(trainingCourseToBeUpdatedSpy).toHaveBeenCalledWith(expectedProps);
        expect(routerSpy).toHaveBeenCalledWith(['../select-which-training-records-to-apply'], {
          relativeTo: route,
        });
      });

      it('should set trainingProviderId and otherTrainingProviderName to null on submit, if user changed deliveredBy to In-house staff', async () => {
        const { getByRole, trainingCourseToBeUpdatedSpy } = await setup({
          journeyType: 'Edit',
        });

        userEvent.click(getByRole('radio', { name: DeliveredBy.InHouseStaff }));

        userEvent.click(getByRole('button', { name: 'Continue' }));

        expect(trainingCourseToBeUpdatedSpy).toHaveBeenCalledWith(
          jasmine.objectContaining({
            deliveredBy: 'In-house staff',
            otherTrainingProviderName: null,
            trainingProviderId: null,
          }),
        );
      });
    });
  });
});
