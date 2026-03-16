import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { PensionsComponent } from './pensions.component';
import { patchRouterUrlForWorkplaceQuestions } from '@core/test-utils/patchUrlForWorkplaceQuestions';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { MockPayAndPensionService } from '@core/test-utils/MockPayAndPensionService';
import { ProgressBarUtil, WorkplaceFlowSections } from '@core/utils/progress-bar-util';

describe('PensionsComponent', () => {
  async function setup(overrides: any = { returnUrl: true, pension: undefined, pensionPercentage: undefined }) {
    const isInAddDetailsFlow = !overrides.returnUrl;

    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      PensionsComponent,
      {
        imports: [SharedModule, RouterModule, ReactiveFormsModule],
        providers: [
          patchRouterUrlForWorkplaceQuestions(isInAddDetailsFlow),
          UntypedFormBuilder,
          {
            provide: EstablishmentService,
            useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, overrides?.returnUrl, {
              pensionContribution: overrides?.pension,
              pensionContributionPercentage: overrides?.pensionPercentage,
            }),
            deps: [HttpClient],
          },
          {
            provide: PayAndPensionService,
            useFactory: MockPayAndPensionService.factory(overrides?.inPayAndPensionsMiniFlow),
            deps: [HttpClient],
          },
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updatePensionContribution').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      establishmentService,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  it('should render a PensionsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the headings', async () => {
    const { getByText } = await setup();
    const heading = `Does your company contribute more than the minimum 3% into workplace pensions for care and support workers?`;

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
      const { getByTestId } = await setup({ returnUrl: null, inPayAndPensionsMiniFlow: true });

      const sectionCaption = 'Workplace';
      expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    });
  });

  describe('check response text', () => {
    it('should show if there is a previous answer and its in the inPayAndPensionsMiniFlow', async () => {
      const { getByTestId } = await setup({ inPayAndPensionsMiniFlow: true });

      const checkPreviousResponseText = getByTestId('check-previous-response');

      expect(checkPreviousResponseText).toBeTruthy();
      expect(
        within(checkPreviousResponseText).getByText('Check your response to an older version of this question.'),
      ).toBeTruthy();
      expect(
        within(checkPreviousResponseText).getByText(
          "If you answered Yes, then we'd like to know the actual percentage contributed (optional).",
        ),
      ).toBeTruthy();
    });

    it('should not show if there is no answer and its in the inPayAndPensionsMiniFlow', async () => {
      const { queryByTestId } = await setup({ inPayAndPensionsMiniFlow: false });

      const checkPreviousResponseText = queryByTestId('check-previous-response');

      expect(checkPreviousResponseText).toBeFalsy();
    });
  });

  it('should render the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      `Workplace pensions are sometimes called 'automatic enrolment', 'company', 'occupational', 'works', or 'work-based' pensions.`,
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
  });

  it('should display text boxes when Yes is selected', async () => {
    const { fixture, getByTestId } = await setup();

    const YesRadio = getByTestId('pensionPercentageRadio-conditional');

    fireEvent.click(YesRadio);
    fixture.detectChanges();

    expect(YesRadio).toHaveClass('govuk-radios__conditional--hidden');
  });

  it('should pre select the second radio button if the establishment has a pension value of Yes', async () => {
    const pensionContribution = 'Yes';
    const { component, fixture } = await setup({
      returnUrl: true,
      pension: pensionContribution,
      pensionPercentage: undefined,
    });

    const radioButton = fixture.nativeElement.querySelector('input[id="pensionsOption-0"]');
    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({
      pension: 'Yes',
      pensionPercentage: undefined,
    });
  });

  it('should prefill the input if the establishment has a pension Percentage value', async () => {
    const pensionContribution = 'Yes';
    const pensionPercentage = 100;

    const { component, fixture } = await setup({
      returnUrl: true,
      pension: pensionContribution,
      pensionPercentage: pensionPercentage,
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.get('pension')?.value).toBe('Yes');
    expect(component.form.get('pensionPercentage')?.value).toBe(100);
  });

  it('should pre select the second radio button if the establishment has a pension value of No', async () => {
    const pensionContribution = 'No';
    const { component, fixture } = await setup({ returnUrl: true, pension: pensionContribution });

    const radioButton = fixture.nativeElement.querySelector('input[id="pensionsOption-1"]');
    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({
      pension: 'No',
      pensionPercentage: undefined,
    });
  });

  it(`should pre select the third radio button if the establishment has a pension value of Don't know`, async () => {
    const pensionContribution = `Don't know`;
    const { component, fixture } = await setup({ returnUrl: true, pension: pensionContribution });

    const radioButton = fixture.nativeElement.querySelector('input[id="pensionsOption-2"]');
    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({
      pension: `Don't know`,
      pensionPercentage: undefined,
    });
  });

  describe('submit buttons and submitting form', () => {
    describe('in the workplace flow', () => {
      it(`should show 'Save and continue' cta button and 'Skip this question'`, async () => {
        const { getByText } = await setup({ returnUrl: false });

        expect(getByText('Save and continue')).toBeTruthy();
        expect(getByText('Skip this question')).toBeTruthy();
      });

      it(`should call the setSubmitAction function with an action of continue and save as true when clicking 'Save and continue' button`, async () => {
        const { component, fixture, getByText } = await setup({ returnUrl: false });

        const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      });

      it(`should call the setSubmitAction function with an action of skip and save as false when clicking 'Skip this question' link`, async () => {
        const { component, fixture, getByText } = await setup({ returnUrl: false });

        const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

        const link = getByText('Skip this question');
        fireEvent.click(link);
        fixture.detectChanges();

        expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'skip', save: false });
      });

      it('should navigate to the next page when submitting from the flow', async () => {
        const { fixture, getByText, routerSpy } = await setup({ returnUrl: false });

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'workplace-data',
          'add-workplace-details',
          'staff-opt-out-of-workplace-pension',
        ]);
      });

      it('should navigate to the next page when skipping from the flow', async () => {
        const { fixture, getByText, routerSpy } = await setup({ returnUrl: false });

        const link = getByText('Skip this question');
        fireEvent.click(link);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'workplace-data',
          'add-workplace-details',
          'staff-opt-out-of-workplace-pension',
        ]);
      });
    });

    describe('from workplace summary', () => {
      it('should not call the updateSingleEstablishmentField when submitting form when the form has not been filled out', async () => {
        const { fixture, getByText, establishmentServiceSpy } = await setup();

        const button = getByText('Save and return');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(establishmentServiceSpy).not.toHaveBeenCalled();
      });

      it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
        const { getByText } = await setup();

        expect(getByText('Save and return')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it(`should call the setSubmitAction function with an action of return and save as true when clicking 'Save and return' button`, async () => {
        const { component, fixture, getByText } = await setup();

        const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

        const button = getByText('Save and return');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      });

      it(`should call the setSubmitAction function with an action of exit and save as false when clicking 'Cancel' link`, async () => {
        const { component, fixture, getByText } = await setup();

        const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

        const link = getByText('Cancel');
        fireEvent.click(link);
        fixture.detectChanges();

        expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      });
    });

    describe('in the pay and pensions mini flow', () => {
      it('should show the "Save and continue" and "Skip this question cta buttons', async () => {
        const { getByText } = await setup({ inPayAndPensionsMiniFlow: true });

        expect(getByText('Save and continue')).toBeTruthy();
        expect(getByText('Skip this question')).toBeTruthy();
      });

      it('should navigate to "staff-opt-out-of-workplace-pension" page', async () => {
        const { getByText, routerSpy, fixture } = await setup({ inPayAndPensionsMiniFlow: true });

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'workplace-data',
          'workplace-summary',
          'staff-opt-out-of-workplace-pension',
        ]);
      });
    });
  });

  describe('progress bar', () => {
    it('should render the section, the question but not the progress bar when not in the flow', async () => {
      const { getByTestId, queryByTestId } = await setup();

      expect(getByTestId('section-heading')).toBeTruthy();
      expect(queryByTestId('progress-bar')).toBeFalsy();
    });

    it('should render the workplace progress bar when in the workplace flow', async () => {
      const { getByTestId } = await setup({ returnUrl: null });

      const sectionIndex = ProgressBarUtil.workplaceFlowProgressBarSections().indexOf(
        WorkplaceFlowSections.PAY_AND_BENEFITS,
      );
      const progressBar = getByTestId('progress-bar');
      const progressBarSection = getByTestId(`currentSection-${sectionIndex}`);

      expect(progressBar).toBeTruthy();
      ProgressBarUtil.workplaceFlowProgressBarSections().forEach((section) => {
        expect(within(progressBar).getByText(section)).toBeTruthy();
      });
      expect(progressBarSection.getAttribute('src')).toEqual('/assets/images/progress-bar/doing.svg');
    });

    it('should render the pay and pension group 2 progress bar when in the mini flow', async () => {
      const { getByTestId } = await setup({ returnUrl: null, inPayAndPensionsMiniFlow: true });

      const payAndPensionsMiniFlowGroup2BarSections = ProgressBarUtil.payAndPensionsMiniFlowGroup2BarSections();
      const sectionIndex = 0;
      const progressBarSection = getByTestId(`currentSection-${sectionIndex}`);
      const progressBar = getByTestId('progress-bar');

      expect(progressBar).toBeTruthy();
      payAndPensionsMiniFlowGroup2BarSections.forEach((section) => {
        expect(within(progressBar).getByText(section)).toBeTruthy();
      });
      expect(progressBarSection.getAttribute('src')).toEqual('/assets/images/progress-bar/doing.svg');
    });
  });
});
