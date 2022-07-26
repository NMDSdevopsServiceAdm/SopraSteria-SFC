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

import { AcceptPreviousCareCertificateComponent } from './accept-previous-care-certificate.component';

describe('AcceptPreviousCareCertificateComponent', () => {
  async function setup(returnUrl = true, acceptCareCertificate = undefined) {
    const { fixture, getByText, getByLabelText, getByTestId, queryByTestId } = await render(
      AcceptPreviousCareCertificateComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl, {
              wouldYouAcceptCareCertificatesFromPreviousEmployment: acceptCareCertificate,
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
      getByLabelText,
      getByTestId,
      queryByTestId,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  it('should render AcceptPreviousCareCertificateComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the heading, input and radio buttons', async () => {
    const { getByText, getByLabelText } = await setup();
    const heading = `Would you accept a Care Certificate from a worker's previous employer?`;

    expect(getByText(heading)).toBeTruthy;
    expect(getByLabelText('Yes, always')).toBeTruthy();
    expect(getByLabelText('Yes, very often')).toBeTruthy();
    expect(getByLabelText('Yes, but not very often')).toBeTruthy();
    expect(getByLabelText('No, never')).toBeTruthy();
  });

  it('should unselect previously selected radio button when another radio button is selected', async () => {
    const { component, fixture, getByLabelText, getByText } = await setup(false);

    const form = component.form;
    const firstRadio = getByLabelText('Yes, always');
    fireEvent.click(firstRadio);
    fixture.detectChanges();

    const secondRadio = getByLabelText('No, never');
    fireEvent.click(secondRadio);
    fixture.detectChanges();

    const submitButton = getByText('Save and continue');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(form.value).toEqual({ acceptCareCertificatesFromPreviousEmployment: 'No, never' });
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.return = null;
      fixture.detectChanges();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should render the section, the question but not the progress bar when not in the flow', async () => {
      const { getByTestId, queryByTestId } = await setup();

      expect(getByTestId('section-heading')).toBeTruthy();
      expect(queryByTestId('progress-bar')).toBeFalsy();
    });

    it('should render the recruitment and staff benefits progress bar when in the staff recruitment flow', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.return = null;
      component.inStaffRecruitmentFlow = true;
      fixture.detectChanges();

      expect(getByTestId('progress-bar-2')).toBeTruthy();
      expect(getByTestId('progress-bar-3')).toBeTruthy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'Skip this question' link`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should navigate to the sharing-data page when skip the question', async () => {
      const { fixture, getByText, routerSpy, component } = await setup();

      component.return = null;
      fixture.detectChanges();

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'cash-loyalty']);
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

      const setSubmitActionSpy = spyOn(component, 'setSubmitAction');

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

  describe('form submissions', () => {
    it('should submit the form with the correct value when the "Yes, always" radio button is selected and the form is submitted', async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup(false);

      const radioButton = getByLabelText('Yes, always');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        property: 'wouldYouAcceptCareCertificatesFromPreviousEmployment',
        value: 'Yes, always',
      });
    });

    it('should submit the form with the correct value when the "Yes, very often" radio button is selected and the form is submitted', async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup(false);

      const radioButton = getByLabelText('Yes, very often');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        property: 'wouldYouAcceptCareCertificatesFromPreviousEmployment',
        value: 'Yes, very often',
      });
    });

    it('should submit the form with the correct value when the "Yes, but not very often" radio button is selected and the form is submitted', async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup(false);

      const radioButton = getByLabelText('Yes, but not very often');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        property: 'wouldYouAcceptCareCertificatesFromPreviousEmployment',
        value: 'Yes, but not very often',
      });
    });

    it('should submit the form with the correct value when the "No, never" radio button is selected and the form is submitted', async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup(false);

      const radioButton = getByLabelText('No, never');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        property: 'wouldYouAcceptCareCertificatesFromPreviousEmployment',
        value: 'No, never',
      });
    });
  });
});
