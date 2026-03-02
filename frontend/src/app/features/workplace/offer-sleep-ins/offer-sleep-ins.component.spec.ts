import { fireEvent, render, within } from '@testing-library/angular';
import { OfferSleepInsComponent } from './offer-sleep-ins.component';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { getTestBed } from '@angular/core/testing';
import { WindowRef } from '@core/services/window.ref';
import { patchRouterUrlForWorkplaceQuestions } from '@core/test-utils/patchUrlForWorkplaceQuestions';
import { of } from 'rxjs';
import { BackService } from '@core/services/back.service';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { MockPayAndPensionService } from '@core/test-utils/MockPayAndPensionService';

describe('OfferSleepInsComponent', () => {
  const options = YesNoDontKnowOptions;

  async function setup(overrides: any = {}) {
    const isInAddDetailsFlow = !overrides.returnToUrl;
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);

    const setupTools = await render(OfferSleepInsComponent, {
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
        {
          provide: PayAndPensionService,
          useFactory: MockPayAndPensionService.factory(overrides.inPayAndPensionsMiniFlow),
          deps: [HttpClient],
        },
        WindowRef,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateEstablishmentFieldWithAudit').and.returnValue(
      of({ ...establishmentService.establishment }),
    );
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

    return { ...setupTools, component, establishmentServiceSpy, routerSpy, backServiceSpy, setSubmitActionSpy };
  }

  it('should render OfferSleepInsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByText } = await setup();

    const heading = 'Does your workplace offer sleep-ins?';

    expect(getByText(heading)).toBeTruthy();
  });

  describe('caption', () => {
    it('should show "Workplace" as the caption when in the pay and permissions mini flow', async () => {
      const { getByTestId } = await setup({ inPayAndPensionsMiniFlow: true });
      const sectionCaption = 'Workplace';

      expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    });

    it('should show "Services" as the caption', async () => {
      const { getByTestId } = await setup();
      const sectionCaption = 'Services';

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
      const overrides = { establishment: { offerSleepIn: 'Yes' } };
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
      it('should set the previous page to service-users question page if canDoDelegatedHealthcareActivities is false', async () => {
        const updatedOverrides = {
          ...overrides,
          establishment: { mainService: { canDoDelegatedHealthcareActivities: false } },
        };

        const { component } = await setup(updatedOverrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'service-users',
        ]);
      });

      it('should set the previous page to what-kind-of-delegated-healthcare-activities question page if canDoDelegatedHealthcareActivities is true', async () => {
        const updatedOverrides = {
          ...overrides,
          establishment: { mainService: { canDoDelegatedHealthcareActivities: true } },
        };

        const { component } = await setup(updatedOverrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'what-kind-of-delegated-healthcare-activities',
        ]);
      });
    });

    it('should navigate to do-you-have-vacancies page when user skips the question', async () => {
      const { getByText, routerSpy, fixture } = await setup(overrides);

      fireEvent.click(getByText('Skip this question'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'do-you-have-vacancies',
      ]);
    });

    it('should navigate to do-you-have-vacancies page after submit if user did not answer', async () => {
      const { getByText, fixture, routerSpy, establishmentServiceSpy } = await setup(overrides);

      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'do-you-have-vacancies',
      ]);
      expect(establishmentServiceSpy).not.toHaveBeenCalled();
    });

    [options[1], options[2]].forEach((option) => {
      it(`should navigate to do-you-have-vacancies page after submit if user answered ${option.label}`, async () => {
        const { component, getByText, getByLabelText, fixture, routerSpy, establishmentServiceSpy } = await setup(
          overrides,
        );

        fireEvent.click(getByLabelText(option.label));
        fixture.detectChanges();
        fireEvent.click(getByText('Save and continue'));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'do-you-have-vacancies',
        ]);
        expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, 'OfferSleepIn', {
          offerSleepIn: option.value,
        });
      });
    });

    it('should navigate to how-do-you-pay-for-sleep-ins page after submit if user answered "Yes', async () => {
      const { component, getByText, getByLabelText, fixture, routerSpy, establishmentServiceSpy } = await setup(
        overrides,
      );

      fireEvent.click(getByLabelText('Yes'));
      fixture.detectChanges();

      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.establishment.uid,
        'workplace-data',
        'add-workplace-details',
        'how-do-you-pay-for-sleep-ins',
      ]);
      expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, 'OfferSleepIn', {
        offerSleepIn: 'Yes',
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
      const { component, fixture, getByText, routerSpy, setSubmitActionSpy } = await setup(overrides);

      const link = getByText('Cancel');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should navigate back to the workplace summary when submit is clicked without an answer', async () => {
      const { fixture, getByText, routerSpy, setSubmitActionSpy } = await setup(overrides);

      const button = getByText('Save');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    [options[1], options[2]].forEach((option) => {
      it(`should navigate to workplace summary after submit if user answered ${option.label}`, async () => {
        const { component, getByText, getByLabelText, fixture, routerSpy, establishmentServiceSpy } = await setup(
          overrides,
        );

        fireEvent.click(getByLabelText(option.label));
        fixture.detectChanges();
        fireEvent.click(getByText('Save'));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
        expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, 'OfferSleepIn', {
          offerSleepIn: option.value,
        });
      });
    });

    it('should navigate to how-do-you-pay-for-sleep-ins page after submit if user answered "Yes', async () => {
      const { component, getByText, getByLabelText, fixture, routerSpy, establishmentServiceSpy } = await setup(
        overrides,
      );

      fireEvent.click(getByLabelText('Yes'));
      fixture.detectChanges();

      fireEvent.click(getByText('Save'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.establishment.uid,
        'workplace-data',
        'workplace-summary',
        'how-do-you-pay-for-sleep-ins',
      ]);
      expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, 'OfferSleepIn', {
        offerSleepIn: 'Yes',
      });
    });
  });
});
