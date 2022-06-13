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
import userEvent from '@testing-library/user-event';

import { RecruitmentAdvertisingCostComponent } from './recruitment-advertising-cost.component';

fdescribe('RecruitmentAdvertisingCostComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText } = await render(RecruitmentAdvertisingCostComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl),
          deps: [HttpClient],
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'postStaffRecruitmentData').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      establishmentService,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  it('should render a RecruitmentAdvertisingCostComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the heading, input and radio buttons', async () => {
    const { getByText, getByLabelText } = await setup();
    const heading = 'How much money have you spent on advertising for staff in the last 4 weeks?';

    expect(getByText(heading)).toBeTruthy;
    expect(getByLabelText('Amount spent')).toBeTruthy();
    expect(getByLabelText('Nothing has been spent on advertising for staff in the last 4 weeks')).toBeTruthy();
    expect(getByLabelText('I do not know how much has been spent on advertising for staff')).toBeTruthy();
  });

  it('should unselect the radio button when radio button is selected and user types into the input', async () => {
    const { component, fixture, getByLabelText } = await setup();

    const form = component.form;
    const radio = getByLabelText('Nothing has been spent on advertising for staff in the last 4 weeks');
    fireEvent.click(radio);
    fixture.detectChanges();

    expect(form.value).toEqual({ amountSpent: null, amountSpentKnown: 'None' });

    const input = getByLabelText('Amount spent');
    userEvent.type(input, '4');
    fixture.detectChanges();

    expect(form.value).toEqual({ amountSpent: '4', amountSpentKnown: null });
  });

  it('should clear the input when a radio button is selected and there is a value in the input', async () => {
    const { component, fixture, getByLabelText } = await setup();

    const form = component.form;

    const input = getByLabelText('Amount spent');
    userEvent.type(input, '4.10');
    fixture.detectChanges();

    expect(form.value).toEqual({ amountSpent: '4.10', amountSpentKnown: null });

    const radio = getByLabelText('I do not know how much has been spent on advertising for staff');
    fireEvent.click(radio);
    fixture.detectChanges();

    expect(form.value).toEqual({ amountSpent: null, amountSpentKnown: `Don't know` });
  });

  describe('submit buttons and submitting form', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View workplace details')).toBeTruthy();
    });

    it('should call the postStaffRecruitmentData when submitting form when the form has not been filled out', async () => {
      const { fixture, getByText, establishmentServiceSpy } = await setup();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', { amountSpent: null });
    });

    it('should call the postStaffRecruitmentData when submitting form with the amount spent filled out', async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

      const input = getByLabelText('Amount spent');
      userEvent.type(input, '440.99');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', { amountSpent: '440.99' });
    });

    it('should call the postStaffRecruitmentData when submitting form with a radio button selected', async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

      const radio = getByLabelText('Nothing has been spent on advertising for staff in the last 4 weeks');
      fireEvent.click(radio);
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', { amountSpent: 'None' });
    });

    // xit('should navigate to the next page when submitting from the flow', async () => {
    //   const { fixture, getByText, routerSpy } = await setup(false);

    //   const button = getByText('Save and continue');
    //   fireEvent.click(button);
    //   fixture.detectChanges();

    //   expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'next-page']);
    // });

    // xit('should navigate to the next page when submitting from the flow', async () => {
    //   const { fixture, getByText, routerSpy } = await setup(false);

    //   const link = getByText('View workplace details');
    //   fireEvent.click(link);
    //   fixture.detectChanges();

    //   expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'check-answers']);
    // });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    xit('should navigate to the summary page when submitting', async () => {
      const { fixture, getByText, routerSpy } = await setup();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });
  });

  describe('errors', () => {
    it('should show an error if text is inputted into the amount spent input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Amount spent');
      userEvent.type(input, 'text');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      const errorMessage = 'Amount spent must be a positive number, like 132 or 150.40';
      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a negative number is inputted into the amount spent input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Amount spent');
      userEvent.type(input, '-100');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      const errorMessage = 'Amount spent must be a positive number, like 132 or 150.40';
      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a negative decimal number is inputted into the amount spent input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Amount spent');
      userEvent.type(input, '-100.30');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      const errorMessage = 'Amount spent must be a positive number, like 132 or 150.40';
      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a number with no numbers after the decimal point is inputted into the amount spent input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Amount spent');
      userEvent.type(input, '100.');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      const errorMessage = 'Amount spent must be a positive number, like 132 or 150.40';
      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a mixture of numbers and text is inputted into the amount spent input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Amount spent');
      userEvent.type(input, '100.asdf.314');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      const errorMessage = 'Amount spent must be a positive number, like 132 or 150.40';
      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a decimal number with more than 2 decimals is inputted into the amount spent input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Amount spent');
      userEvent.type(input, '100.301');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      const errorMessage = 'Amount spent must only include pence, like 132.00 or 150.40';
      expect(getAllByText(errorMessage).length).toEqual(2);
    });
  });
});
