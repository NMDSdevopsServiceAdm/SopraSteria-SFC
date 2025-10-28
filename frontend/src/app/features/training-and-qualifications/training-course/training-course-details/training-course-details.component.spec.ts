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
import { MockTrainingCourseService } from '@core/test-utils/MockTrainingCourseService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TrainingCourseDetailsComponent } from './training-course-details.component';

describe('TrainingCourseDetailsComponent', () => {
  async function setup(overrides: any = {}) {
    const newTrainingCourseToBeAdded = overrides?.newTrainingCourseToBeAdded;
    const journeyType = overrides?.journeyType ?? 'Add';

    const setupTools = await render(TrainingCourseDetailsComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: TrainingCourseService,
          useFactory: MockTrainingCourseService.factory({ newTrainingCourseToBeAdded }),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { establishment: { uid: 'mock-uid' }, journeyType },
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

    const trainingCourseService = injector.inject(TrainingCourseService);
    const trainingCourseServiceSpy = spyOnProperty(trainingCourseService, 'newTrainingCourseToBeAdded', 'set');

    const getInputByLabelText = (label: any) => setupTools.getByLabelText(label) as HTMLInputElement;
    const getInputByRole = (role: any, options: any) => setupTools.getByRole(role, options) as HTMLInputElement;

    return {
      ...setupTools,
      getInputByLabelText,
      getInputByRole,
      component,
      routerSpy,
      trainingCourseService,
      trainingCourseServiceSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a heading for the page', async () => {
    const { getByRole, getByText } = await setup();

    const expectedHeadingText = 'Add training course details';
    expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
    expect(getByText('Add a training course')).toBeTruthy();
  });

  describe('prefill', () => {
    describe('when adding new training course', () => {
      // for the case when user return from select category page to this page
      it('should prefill the form with data from TrainingCourseService if adding a new course', async () => {
        const mockTrainingCourse = {
          name: 'First aid course',
          accredited: 'No',
          deliveredBy: 'External provider',
          externalProviderName: 'Care skills academy',
          howWasItDelivered: 'E-learning',
          doesNotExpire: false,
          validityPeriodInMonth: 24,
        };

        const { getInputByRole, getInputByLabelText, fixture } = await setup({
          journeyType: 'Add',
          newTrainingCourseToBeAdded: mockTrainingCourse,
        });

        fixture.detectChanges();

        expect(getInputByLabelText('Training course name').value).toEqual('First aid course');
        expect(getInputByRole('radio', { name: 'No' }).checked).toBeTrue();
        expect(getInputByRole('radio', { name: 'External provider' }).checked).toBeTrue();
        expect(getInputByLabelText('Provider name').value).toEqual('Care skills academy');
        expect(getInputByRole('radio', { name: 'E-learning' }).checked).toBeTrue();
        expect(getInputByLabelText(/How many months is/).value).toEqual('24');
        expect(getInputByRole('checkbox', { name: 'This training does not expire' }).checked).toBeFalse();
      });
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
    describe('when adding new training course', () => {
      it('should show a Continue button and a Cancel button', async () => {
        const { getByRole } = await setup({ journeyType: 'Add' });

        expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
        expect(getByRole('button', { name: 'Cancel' })).toBeTruthy();
      });

      it('should save the current training course in trainingCourseService, and navigate to select category page', async () => {
        const { getByRole, getByLabelText, trainingCourseServiceSpy, routerSpy, component } = await setup({
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
          externalProviderName: 'Care skill academy',
          howWasItDelivered: 'Face to face',
          validityPeriodInMonth: 24,
          doesNotExpire: null,
        } as Partial<TrainingCourse>;

        expect(trainingCourseServiceSpy).toHaveBeenCalledWith(expectedProps);
        // @ts-expect-error: TS2341: Property 'route' is private
        expect(routerSpy).toHaveBeenCalledWith(['../select-category'], { relativeTo: component.route });
      });

      it('should set externalProviderName to null on submit if user changed deliveredBy to In-house staff', async () => {
        const { getByRole, getByLabelText, trainingCourseServiceSpy } = await setup();

        userEvent.type(getByLabelText('Training course name'), 'First aid course');
        userEvent.click(getByRole('radio', { name: DeliveredBy.ExternalProvider }));
        userEvent.type(getByRole('textbox', { name: 'Provider name' }), 'Care skills academy');
        userEvent.click(getByRole('radio', { name: DeliveredBy.InHouseStaff }));
        userEvent.click(getByLabelText('This training does not expire'));

        userEvent.click(getByRole('button', { name: 'Continue' }));

        expect(trainingCourseServiceSpy).toHaveBeenCalledWith(
          jasmine.objectContaining({ deliveredBy: 'In-house staff', externalProviderName: null }),
        );
      });

      it('the cancel button should link to the "Add and manage training course" page', async () => {
        const { getByRole } = await setup({ journeyType: 'Add' });

        const cancelButton = getByRole('button', { name: 'Cancel' });
        expect(cancelButton.getAttribute('href')).toEqual(
          '/workplace/mock-establishment-uid/training-course/add-and-manage-training-courses',
        );
      });
    });
  });
});
