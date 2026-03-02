import { of } from 'rxjs';

import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { patchRouterUrlForWorkplaceQuestions } from '@core/test-utils/patchUrlForWorkplaceQuestions';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { StaffOptOutOfWorkplacePensionComponent } from './staff-opt-out-of-workplace-pension.component';

fdescribe('StaffOptOutOfWorkplacePensionComponent', () => {
  const options = YesNoDontKnowOptions;

  async function setup(overrides: any = {}) {
    const isInAddDetailsFlow = !overrides.returnToUrl;
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);

    const setupTools = await render(StaffOptOutOfWorkplacePensionComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        patchRouterUrlForWorkplaceQuestions(isInAddDetailsFlow),
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
        },
        {
          provide: BackService,
          useValue: backServiceSpy,
        },
        WindowRef,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateSingleEstablishmentField').and.returnValue(
      of({ data: {} }),
    );
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

    return { ...setupTools, component, establishmentServiceSpy, routerSpy, backServiceSpy, setSubmitActionSpy };
  }

  it('should render StaffOptOutOfWorkplacePensionComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByText } = await setup();

    const heading = 'Are any of your staff currently opted out of their workplace pension?';

    expect(getByText(heading)).toBeTruthy();
  });

  describe('caption', () => {
    it('should show "Pay and benefits" as the caption', async () => {
      const { getByTestId } = await setup();
      const sectionCaption = 'Pay and benefits';

      expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    });
  });

  describe('form', () => {
    it('should show the radio buttons', async () => {
      const { getByRole } = await setup();

      options.forEach((option) => {
        expect(getByRole('radio', { name: option.label })).toBeTruthy();
      });
    });

    it('should prefill when there is a previously saved answer', async () => {
      const overrides = { establishment: { staffOptOutOfWorkplacePension: 'Yes' } };
      const { getByLabelText } = await setup(overrides);

      const radioButton = getByLabelText('Yes') as HTMLInputElement;

      expect(radioButton.checked).toBeTruthy();
    });
  });

  describe('workplace flow', () => {
    const overrides = { returnToUrl: null };

    it('should show a progress bar', async () => {
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should show a "Save and continue" cta button and "Skip this question" link', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    describe('back link', () => {
      it('should set the previous page to pensions question page', async () => {
        const { component } = await setup(overrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'pensions',
        ]);
      });

      it('should navigate to staff-benefit-holiday-leave page when user skips the question', async () => {
        const { getByText, routerSpy, fixture } = await setup(overrides);

        userEvent.click(getByText('Skip this question'));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'workplace-data',
          'add-workplace-details',
          'staff-benefit-holiday-leave',
        ]);
      });

      it('should navigate to staff-benefit-holiday-leave after submit if user did not answer', async () => {
        const { getByText, fixture, routerSpy, establishmentServiceSpy } = await setup(overrides);

        userEvent.click(getByText('Save and continue'));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'workplace-data',
          'add-workplace-details',
          'staff-benefit-holiday-leave',
        ]);
        expect(establishmentServiceSpy).not.toHaveBeenCalled();
      });

      options.forEach((option) => {
        it(`should navigate to staff-benefit-holiday-leave page after submit if user answered ${option.label}`, async () => {
          const { component, getByText, getByLabelText, routerSpy, establishmentServiceSpy } = await setup(overrides);

          userEvent.click(getByLabelText(option.label));
          userEvent.click(getByText('Save and continue'));

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            component.establishment.uid,
            'workplace-data',
            'add-workplace-details',
            'staff-benefit-holiday-leave',
          ]);
          expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, {
            property: 'staffOptOutOfWorkplacePension',
            value: option.value,
          });
        });
      });
    });
  });

  describe('when viewing the page from the workplace summary', () => {
    const overrides = { returnTo: { url: ['/dashboard'], fragment: 'workplace' } };

    it('should not show a progress bar', async () => {
      const { queryByTestId } = await setup(overrides);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });

    it('should set the previous page to workplace summary', async () => {
      const { backServiceSpy } = await setup(overrides);

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/dashboard'],
        fragment: 'workplace',
      });
    });

    it('should show a "Save" cta button and "Cancel" link', async () => {
      const { getByText, queryByText } = await setup(overrides);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(queryByText('Save and continue')).toBeFalsy();
      expect(queryByText('Save and return')).toBeFalsy();
    });

    it(`should call the setSubmitAction function with an action of exit and save as false when clicking 'Cancel' link`, async () => {
      const { fixture, getByText, routerSpy, setSubmitActionSpy } = await setup(overrides);

      const link = getByText('Cancel');
      userEvent.click(link);
      fixture.detectChanges();

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should navigate back to the workplace summary when submit is clicked without an answer', async () => {
      const { fixture, getByText, routerSpy, setSubmitActionSpy } = await setup(overrides);

      const button = getByText('Save');
      userEvent.click(button);
      fixture.detectChanges();

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    options.forEach((option) => {
      it(`should navigate to workplace summary after submit if user answered ${option.label}`, async () => {
        const { component, getByText, getByLabelText, routerSpy, establishmentServiceSpy } = await setup(overrides);

        userEvent.click(getByLabelText(option.label));
        userEvent.click(getByText('Save'));

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
        expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, {
          property: 'staffOptOutOfWorkplacePension',
          value: option.value,
        });
      });
    });
  });
});
