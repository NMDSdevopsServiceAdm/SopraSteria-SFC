import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { PensionsComponent } from './pensions.component';

describe('PensionsComponent', () => {
  async function setup(returnUrl = true, pension = undefined) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      PensionsComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: EstablishmentService,
            useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl, {
              pensionContribution: pension,
            }),
            deps: [HttpClient],
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateSingleEstablishmentField').and.callThrough();
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
    const heading = `Do you contribute more than the minimum 3% into workplace pensions for your care workers?`;

    expect(getByText(heading)).toBeTruthy;
  });

  it('should render the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      `This data is used to determine whether rewards and benefits act as incentives when it comes to staff retention. It also reveals the type of incentives that are being offered in the sector and how common they are.`,
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
  });

  it('should pre select the first radio button if the establishment has a pension value of Yes', async () => {
    const pensionContribution = 'Yes';
    const { component, fixture } = await setup(true, pensionContribution);

    const radioButton = fixture.nativeElement.querySelector('input[id="pensionsOption-0"]');
    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({ pension: 'Yes' });
  });

  it('should pre select the second radio button if the establishment has a pension value of No', async () => {
    const pensionContribution = 'No';
    const { component, fixture } = await setup(true, pensionContribution);

    const radioButton = fixture.nativeElement.querySelector('input[id="pensionsOption-1"]');
    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({ pension: 'No' });
  });

  it(`should pre select the third radio button if the establishment has a pension value of Don't know`, async () => {
    const pensionContribution = `Don't know`;
    const { component, fixture } = await setup(true, pensionContribution);

    const radioButton = fixture.nativeElement.querySelector('input[id="pensionsOption-2"]');
    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({ pension: `Don't know` });
  });

  describe('submit buttons and submitting form', () => {
    it(`should show 'Save and continue' cta button and 'Skip this question'`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should call the setSubmitAction function with an action of continue and save as true when clicking 'Save and continue' button`, async () => {
      const { component, fixture, getByText } = await setup(false);

      const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
    });

    it(`should call the setSubmitAction function with an action of skip and save as false when clicking 'Skip this question' link`, async () => {
      const { component, fixture, getByText } = await setup(false);

      const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

      const link = getByText('Skip this question');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'skip', save: false });
    });

    it('should not call the updateSingleEstablishmentField when submitting form when the form has not been filled out', async () => {
      const { fixture, getByText, establishmentServiceSpy } = await setup();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).not.toHaveBeenCalled();
    });

    it('should navigate to the next page when submitting from the flow', async () => {
      const { fixture, getByText, routerSpy } = await setup(false);

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'staff-benefit-holiday-leave']);
    });

    it('should navigate to the next page when skipping from the flow', async () => {
      const { component, fixture, getByText, routerSpy } = await setup(false);

      const link = getByText('Skip this question');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'staff-benefit-holiday-leave']);
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

  describe('progress bar', () => {
    it('should render the section, the question but not the progress bar when not in the flow', async () => {
      const { getByText, getByTestId, queryByTestId, fixture, component } = await setup();
      component.inStaffRecruitmentFlow = false;
      fixture.detectChanges();

      expect(getByTestId('section-heading')).toBeTruthy();
      expect(queryByTestId('progress-bar')).toBeFalsy();
      expect(queryByTestId('progress-bar-2')).toBeFalsy();
      expect(queryByTestId('progress-bar-3')).toBeFalsy();
    });

    it('should render the progress bar when in the flow', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.return = null;
      component.inStaffRecruitmentFlow = true;

      fixture.detectChanges();

      expect(getByTestId('progress-bar-2')).toBeTruthy();
      expect(getByTestId('progress-bar-3')).toBeTruthy();
    });

    it('should render the workplace progress bar when in the workplace flow', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.return = null;
      component.inStaffRecruitmentFlow = false;
      fixture.detectChanges();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });
  });
});
