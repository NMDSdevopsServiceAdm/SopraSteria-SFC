import { of } from 'rxjs';

import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { patchRouterUrlForWorkplaceQuestions } from '@core/test-utils/patchUrlForWorkplaceQuestions';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TravelTimePayComponent } from './travel-time-pay.component';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import {
  MockPayAndPensionService,
  mockPayAndPensionsGroup1ProgressBarSections,
} from '@core/test-utils/MockPayAndPensionService';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

describe('TravelTimePayComponent', () => {
  const travelTimePayOptions = [
    {
      id: 1,
      label: 'The same rate for travel time as for visits',
      includeRate: false,
    },
    {
      id: 2,
      label: 'Minimum wage',
      includeRate: false,
    },
    {
      id: 3,
      label: 'A different travel time rate',
      includeRate: true,
    },
  ];

  async function setup(overrides: any = {}) {
    const isInAddDetailsFlow = !overrides.returnToUrl;
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);

    const setupTools = await render(TravelTimePayComponent, {
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
          provide: PayAndPensionService,
          useFactory: MockPayAndPensionService.factory(overrides),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                travelTimePayOptions: travelTimePayOptions,
              },
            },
          },
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
    const establishmentServiceSpy = spyOn(establishmentService, 'updateEstablishmentFieldWithAudit').and.returnValue(
      of({ data: {} }),
    );
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

    const alert = injector.inject(AlertService) as AlertService;

    const alertSpy = spyOn(alert, 'addAlert').and.callThrough();

    return {
      ...setupTools,
      component,
      establishmentServiceSpy,
      routerSpy,
      backServiceSpy,
      setSubmitActionSpy,
      alertSpy,
    };
  }

  it('should render TravelTimePayComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByText } = await setup();

    const heading = 'What do you pay care and support workers for travel time between visits?';

    expect(getByText(heading)).toBeTruthy();
  });

  describe('caption', () => {
    it('should show "Pay and benefits" when in the workplace flow', async () => {
      const { getByTestId } = await setup({ returnUrl: true, inPayAndPensionsMiniFlow: false });

      const sectionCaption = 'Pay and benefits';
      expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    });

    it('should show "Pay and benefits" when coming from the workplace summary', async () => {
      const { getByTestId } = await setup({
        returnUrl: { url: ['/dashboard'], fragment: 'workplace' },
        inPayAndPensionsMiniFlow: false,
      });

      const sectionCaption = 'Pay and benefits';
      expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    });

    it('should show "Workplace" when in the pay and pensions mini flow', async () => {
      const { getByTestId } = await setup({ inPayAndPensionsMiniFlow: true });

      const sectionCaption = 'Workplace';
      expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    });
  });

  describe('form', () => {
    it('should show the radio buttons', async () => {
      const { getByRole } = await setup();

      travelTimePayOptions.forEach((option) => {
        expect(getByRole('radio', { name: option.label })).toBeTruthy();
      });
    });
  });

  describe('workplace flow', () => {
    const overrides = { returnToUrl: null };

    it('should show a progress bar', async () => {
      const { component, getByTestId } = await setup(overrides);

      const sectionIndex = component.progressBarSections.indexOf(WorkplaceFlowSections.PAY_AND_BENEFITS);

      const progressBar = getByTestId('progress-bar');
      const progressBarSection = getByTestId(`currentSection-${sectionIndex}`);

      expect(getByTestId('progress-bar')).toBeTruthy();
      component.progressBarSections.forEach((section) => {
        expect(within(progressBar).getByText(section)).toBeTruthy();
      });
      expect(progressBarSection.getAttribute('src')).toEqual('/assets/images/progress-bar/doing.svg');
    });

    it('should show a "Save and continue" cta button and "Skip this question" link', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should set the previous page to how-many-leavers question page', async () => {
      const { component, backServiceSpy } = await setup(overrides);

      expect(component.previousRoute).toEqual([
        '/workplace',
        component.establishment.uid,
        'workplace-data',
        'add-workplace-details',
        'how-many-leavers',
      ]);
      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/workplace', 'mocked-uid', 'workplace-data', 'add-workplace-details', 'how-many-leavers'],
      });
    });

    it('should navigate to benefits-statutory-sick-pay page when user skips the question', async () => {
      const { getByText, routerSpy, fixture } = await setup(overrides);

      await userEvent.click(getByText('Skip this question'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'benefits-statutory-sick-pay',
      ]);
    });

    it('should navigate to benefits-statutory-sick-pay after submit if user did not answer', async () => {
      const { getByRole, fixture, routerSpy, establishmentServiceSpy } = await setup(overrides);

      await userEvent.click(getByRole('button', { name: /save and continue/i }));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'benefits-statutory-sick-pay',
      ]);

      expect(establishmentServiceSpy).toHaveBeenCalled();
    });

    travelTimePayOptions.forEach((option) => {
      it(`should navigate to benefits-statutory-sick-pay page after submit if user answered ${option.label}`, async () => {
        const { component, getByRole, getByLabelText, routerSpy, establishmentServiceSpy } = await setup(overrides);

        await userEvent.click(getByLabelText(option.label));

        if (option.id === 3) {
          const rateInput = getByLabelText(/amount/i);
          await userEvent.type(rateInput, '12.21');
        }

        await userEvent.click(getByRole('button', { name: /save and continue/i }));

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'benefits-statutory-sick-pay',
        ]);

        const props = {
          travelTimePay: {
            id: option.id,
            ...(option.id === 3 && { rate: 12.21 }),
          },
        };

        expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, 'TravelTimePay', props);
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

    it('should show a "Save and return" cta button and "Cancel" link', async () => {
      const { getByText, queryByText } = await setup(overrides);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(queryByText('Save and continue')).toBeFalsy();
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

      const button = getByText('Save and return');
      userEvent.click(button);
      fixture.detectChanges();

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    travelTimePayOptions.forEach((option) => {
      it(`should navigate to workplace summary  page after submit if user answered ${option.label}`, async () => {
        const { component, getByRole, getByLabelText, fixture, routerSpy, establishmentServiceSpy } = await setup(
          overrides,
        );

        fireEvent.click(getByLabelText(option.label));
        fixture.detectChanges();

        if (option.id === 3) {
          const rateInput = fixture.nativeElement.querySelector('#travelTimePayRate');
          fireEvent.input(rateInput, { target: { value: '12.21' } });
          fixture.detectChanges();
        }

        fireEvent.click(getByRole('button', { name: /save and return/i }));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });

        const props = {
          travelTimePay: {
            id: option.id,
            ...(option.id === 3 && { rate: 12.21 }),
          },
        };

        expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, 'TravelTimePay', props);
      });
    });
  });

  describe('when viewing the page in the pay and pension mini flow', () => {
    const overrides = {
      returnToUrl: true,
      returnTo: { url: ['/dashboard'], fragment: 'home' },
      inPayAndPensionsMiniFlow: true,
      payAndPensionsGroup: 1,
      establishment: {
        travelTimePay: null,
        mainService: { payAndPensionsGroup: 1 },
      },
    };

    it('should render the pay and pension group progress bar when in the mini flow', async () => {
      const updatedOverrides = {
        ...overrides,
        payAndPensionsGroup: 1,
      };
      const { getByTestId } = await setup(updatedOverrides);

      const sectionIndex = 3;
      const progressBarSection = getByTestId(`currentSection-${sectionIndex}`);
      const progressBar = getByTestId('progress-bar');

      expect(progressBar).toBeTruthy();
      mockPayAndPensionsGroup1ProgressBarSections.forEach((section) => {
        expect(within(progressBar).getByText(section)).toBeTruthy();
      });
      expect(progressBarSection.getAttribute('src')).toEqual('/assets/images/progress-bar/doing.svg');
    });

    it('should set the previous page to how-do-you-pay-for-sleep-ins when in the pay and pension mini flow', async () => {
      const { backServiceSpy } = await setup(overrides);

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/workplace', 'mocked-uid', 'workplace-data', 'workplace-summary', 'how-do-you-pay-for-sleep-ins'],
      });
    });

    it('should show the "Save and continue" and "Skip this question cta buttons', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should navigate to home page when page when "Skip this question" is clicked', async () => {
      const { getByText, routerSpy, fixture, alertSpy } = await setup(overrides);

      const button = getByText('Skip this question');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home', queryParams: undefined });
      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Workplace details added',
      } as Alert);
    });

    it('should navigate to the home page when submitting without a selecting an option', async () => {
      const { getByText, establishmentServiceSpy, routerSpy, fixture, alertSpy } = await setup(overrides);

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home', queryParams: undefined });
      expect(establishmentServiceSpy).not.toHaveBeenCalled();
      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Workplace details added',
      } as Alert);
    });

    it('should navigate to the home page when submitting with a selected option', async () => {
      const { component, getByLabelText, getByText, establishmentServiceSpy, routerSpy, fixture, alertSpy } =
        await setup(overrides);

      userEvent.click(getByLabelText(travelTimePayOptions[0].label));
      fixture.autoDetectChanges();

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home', queryParams: undefined });

      const props = {
        travelTimePay: {
          id: travelTimePayOptions[0].id,
        },
      };

      expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, 'TravelTimePay', props);
      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Workplace details added',
      } as Alert);
    });
  });
});
