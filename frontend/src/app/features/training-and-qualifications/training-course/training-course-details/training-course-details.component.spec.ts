import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { render } from '@testing-library/angular';

import { TrainingCourseDetailsComponent } from './training-course-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeliveredBy } from '@core/model/training.model';
import { SharedModule } from '../../../../shared/shared.module';
import userEvent from '@testing-library/user-event';

fdescribe('AddAndManageTrainingCoursesComponent', () => {
  async function setup(overrides: any = {}) {
    const trainingCourses = overrides?.trainingCourses ?? [];

    const setupTools = await render(TrainingCourseDetailsComponent, {
      imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { establishment: { uid: 'mock-uid' }, trainingCourses },
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

    const expectedHeadingText = 'Add training course details';
    expect(getByRole('heading', { level: 1 }).textContent).toContain(expectedHeadingText);
    expect(getByText('Add a training course')).toBeTruthy();
  });

  describe('input form', async () => {
    it('should show a text input for provider name if user select "External provider" for delivered by external provider', async () => {
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

    it('should clear the doesNotExpire checkbox when validityPeriodInMonth is entered', async () => {
      const { getByRole, getByTestId, fixture } = await setup();

      const doesNotExpireCheckbox = getByRole('checkbox', {
        name: 'This training does not expires',
      }) as HTMLInputElement;
      doesNotExpireCheckbox.click();
      expect(doesNotExpireCheckbox.checked).toBeTrue();

      getByTestId('plus-button-validity-period').click();
      fixture.detectChanges();

      expect(doesNotExpireCheckbox.checked).toBeFalse();
    });

    it('should clear the validityPeriodInMonth input when doesNotExpire is checked', async () => {
      const { getByRole, getByTestId, fixture } = await setup();

      const validityPeriodInMonth = getByRole('textbox', {
        name: 'How many months is the training valid for before it expires?',
      }) as HTMLInputElement;
      const doesNotExpireCheckbox = getByRole('checkbox', {
        name: 'This training does not expires',
      }) as HTMLInputElement;

      getByTestId('plus-button-validity-period').click();
      fixture.detectChanges();
      expect(validityPeriodInMonth.value).toEqual('1');

      doesNotExpireCheckbox.click();
      fixture.detectChanges();

      expect(validityPeriodInMonth.value).toEqual('');
    });
  });

  describe('when adding new training course', () => {
    it('should show a Continue button and a Cancel button', async () => {
      const { getByRole } = await setup();

      expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
      expect(getByRole('button', { name: 'Cancel' })).toBeTruthy();
    });

    it('the cancel button should link to the "Add and manage training course" page', async () => {
      const { getByRole } = await setup();

      const cancelButton = getByRole('button', { name: 'Cancel' });
      expect(cancelButton.getAttribute('href')).toEqual(
        '/workplace/mock-establishment-uid/training-course/add-and-manage-training-courses',
      );
    });
  });
});
