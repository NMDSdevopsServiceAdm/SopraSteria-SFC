import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { HowDoYouPayForSleepInsComponent } from './how-do-you-pay-for-sleep-ins.component';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WindowRef } from '@core/services/window.ref';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { patchRouterUrlForWorkplaceQuestions } from '@core/test-utils/patchUrlForWorkplaceQuestions';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { MockPayAndPensionService } from '@core/test-utils/MockPayAndPensionService';
import { getTestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BackService } from '@core/services/back.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { AlertService } from '@core/services/alert.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { Alert } from '@core/model/alert.model';

describe('HowDoYouPayForSleepInsComponent', () => {
  const options = ['Hourly rate', 'Flat rate', 'I do not know'];

  async function setup(overrides: any = {}) {
    const isInAddDetailsFlow = !overrides.returnToUrl;
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);

    const setupTools = await render(HowDoYouPayForSleepInsComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        patchRouterUrlForWorkplaceQuestions(isInAddDetailsFlow),
        UntypedFormBuilder,
        AlertService,
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
        {
          provide: PreviousRouteService,
          useValue: { getPreviousPage: () => overrides?.previousPage },
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

    const alert = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alert, 'addAlert').and.callThrough();

    return { ...setupTools, component, routerSpy, establishmentServiceSpy, backServiceSpy, alertSpy };
  }

  it('should render HowDoYouPayForSleepInsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByText } = await setup();

    const heading = 'How do you pay care and support workers for a sleep-in?';

    expect(getByText(heading)).toBeTruthy();
  });

  describe('caption', () => {
    it('should show "Workplace" as the caption when in the pay and penmsions mini flow', async () => {
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

  it('should show the reveal title with the reason for asking question', async () => {
    const { getByText } = await setup();

    expect(getByText('Why we ask for this information')).toBeTruthy();
    expect(
      getByText(
        'The information will be used by DHSC and other sector bodies to ensure the Fair Pay Agreement is based on accurate data. It will not be shared in any way that identifies your workplace or staff.',
      ),
    ).toBeTruthy();
  });

  describe('form', () => {
    it('should show the radio buttons', async () => {
      const { getByRole } = await setup();

      options.forEach((option) => {
        expect(getByRole('radio', { name: option })).toBeTruthy();
      });
    });

    it('should prefill when there is a previously saved answer', async () => {
      const overrides = { establishment: { howToPayForSleepIn: options[0] } };
      const { getByLabelText } = await setup(overrides);

      const radioButton = getByLabelText(options[0]) as HTMLInputElement;

      expect(radioButton.checked).toBeTruthy();
    });
  });

  describe('inside workplace flow', () => {
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
      it('should set the previous page to workplace-offer-sleep-ins question page', async () => {
        const { component } = await setup(overrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'workplace-offer-sleep-ins',
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

    options.forEach((option) => {
      it(`should navigate to do-you-have-vacancies page after submit if user answered ${option}`, async () => {
        const { component, getByText, fixture, getByLabelText, routerSpy, establishmentServiceSpy } = await setup(
          overrides,
        );

        fireEvent.click(getByLabelText(option));
        fixture.detectChanges();

        fireEvent.click(getByText('Save and continue'));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'workplace-data',
          'add-workplace-details',
          'do-you-have-vacancies',
        ]);
        expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, {
          property: 'howToPayForSleepIn',
          value: option,
        });
      });
    });
  });

  describe('from workplace summary', () => {
    const overrides = { returnTo: { url: ['/dashboard'], fragment: 'workplace' } };

    it('should not show a progress bar', async () => {
      const { queryByTestId } = await setup(overrides);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });

    describe('back link', () => {
      const returnTo = {
        url: ['/dashboard'],
        fragment: 'workplace',
      };
      it('should set the previous page to workplace summary when directly visited from workplace summary', async () => {
        const updatedOverrides = {
          ...overrides,
          previousPage: 'workplace',
        };
        const { backServiceSpy } = await setup(updatedOverrides);

        expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
          url: ['/dashboard'],
          fragment: 'workplace',
        });
      });

      it('should be set to offer-sleep-ins when visited via workplace summary then offer sleep ins', async () => {
        const updatedOverrides = {
          ...overrides,
          previousPage: 'workplace-offer-sleep-ins',
        };
        const { component, backServiceSpy } = await setup(updatedOverrides);

        expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
          url: [
            '/workplace',
            component.establishment.uid,
            'workplace-data',
            'workplace-summary',
            'workplace-offer-sleep-ins',
          ],
        });
      });
    });

    it('should show a "Save and return" cta button and "Cancel" link', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should navigate back to the workplace summary when clicking "Cancel" link', async () => {
      const { fixture, getByText, routerSpy } = await setup(overrides);

      const link = getByText('Cancel');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should navigate back to the workplace summary when submit is clicked without an answer', async () => {
      const { fixture, getByText, routerSpy } = await setup(overrides);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    options.forEach((option) => {
      it(`should navigate back to the workplace summary after submit if user answered ${option}`, async () => {
        const { component, getByText, fixture, getByLabelText, routerSpy, establishmentServiceSpy } = await setup(
          overrides,
        );

        fireEvent.click(getByLabelText(option));
        fixture.detectChanges();

        fireEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
        expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, {
          property: 'howToPayForSleepIn',
          value: option,
        });
      });
    });
  });

  describe('when viewing the page in the pay and pension mini flow', () => {
    const overrides = {
      returnToUrl: true,
      returnTo: { url: ['/dashboard'], fragment: 'home' },
      inPayAndPensionsMiniFlow: true,
      establishment: { mainService: { payAndPensionsGroup: 2 } },
    };

    it('should render the pay and pension group 2 progress bar when in the mini flow', async () => {
      const { getByTestId } = await setup(overrides);

      const payAndPensionsMiniFlowGroup2BarSections = ProgressBarUtil.payAndPensionsMiniFlowGroup2BarSections();
      const sectionIndex = 2;
      const progressBarSection = getByTestId(`currentSection-${sectionIndex}`);
      const progressBar = getByTestId('progress-bar');

      expect(progressBar).toBeTruthy();
      payAndPensionsMiniFlowGroup2BarSections.forEach((section) => {
        expect(within(progressBar).getByText(section)).toBeTruthy();
      });
      expect(progressBarSection.getAttribute('src')).toEqual('/assets/images/progress-bar/doing.svg');
    });

    it('should show the "Save and continue" and "Skip this question cta buttons', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should navigate to home page when page when "Skip this question" is clicked', async () => {
      const { getByText, routerSpy, fixture } = await setup(overrides);

      const button = getByText('Skip this question');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home', queryParams: undefined });
    });

    it(`should navigate to the home page when submitting without a selecting an option`, async () => {
      const { getByText, establishmentServiceSpy, routerSpy, fixture, alertSpy } = await setup(overrides);

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home', queryParams: undefined });
      expect(establishmentServiceSpy).not.toHaveBeenCalled();
      await fixture.whenStable();
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should navigate to the home page when submitting with an option', async () => {
      const { component, getByLabelText, getByText, establishmentServiceSpy, routerSpy, fixture, alertSpy } =
        await setup(overrides);

      fireEvent.click(getByLabelText(options[0]));
      fixture.detectChanges();
      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home', queryParams: undefined });
      expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, {
        property: 'howToPayForSleepIn',
        value: options[0],
      });
      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Your information has been saved in Workplace',
      } as Alert);
    });
  });
});
