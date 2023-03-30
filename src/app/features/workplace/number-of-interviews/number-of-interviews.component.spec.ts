import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { NumberOfInterviewsComponent } from './number-of-interviews.component';

describe('NumberOfInterviews', () => {
  async function setup(returnUrl = true, numberOfInterviews = undefined) {
    const { fixture, getByText, getByTestId, getAllByText, queryByTestId, getByLabelText, queryByText } = await render(
      NumberOfInterviewsComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: EstablishmentService,
            useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl, {
              peopleInterviewedInTheLastFourWeeks: numberOfInterviews,
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
      queryByText,
      establishmentService,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  it('should render a NumberOfInterviewsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the heading, input and radio buttons', async () => {
    const { getByText, getByLabelText } = await setup();
    const heading = `How many people have you interviewed for care worker roles in the last 4 weeks?`;

    expect(getByText(heading)).toBeTruthy;
    expect(getByLabelText('Number of people interviewed')).toBeTruthy();
    expect(getByLabelText('Nobody has been interviewed in the last 4 weeks')).toBeTruthy();
    expect(getByLabelText('I do not know how many people have been interviewed')).toBeTruthy();
  });

  it('should unselect the radio button when radio button is selected and user types into the input', async () => {
    const { component, fixture, getByLabelText } = await setup();

    const form = component.form;
    const radio = getByLabelText('Nobody has been interviewed in the last 4 weeks');
    fireEvent.click(radio);
    fixture.detectChanges();

    expect(form.value).toEqual({ numberOfInterviews: null, numberOfInterviewsKnown: 'None' });

    const input = getByLabelText('Number of people interviewed');
    userEvent.type(input, '4');
    fixture.detectChanges();

    expect(form.value).toEqual({ numberOfInterviews: '4', numberOfInterviewsKnown: null });
  });

  it('should clear the input when a radio button is selected and there is a value in the input', async () => {
    const { component, fixture, getByLabelText } = await setup();

    const form = component.form;

    const input = getByLabelText('Number of people interviewed');
    userEvent.type(input, '4');
    fixture.detectChanges();

    expect(form.value).toEqual({ numberOfInterviews: '4', numberOfInterviewsKnown: null });

    const radio = getByLabelText('I do not know how many people have been interviewed');
    fireEvent.click(radio);
    fixture.detectChanges();

    expect(form.value).toEqual({ numberOfInterviews: null, numberOfInterviewsKnown: `Don't know` });
  });

  it('should prefill the input if the establishment has a number of interviews value', async () => {
    const numberOfInterviews = '100';
    const { component, fixture } = await setup(true, numberOfInterviews);

    const input = fixture.nativeElement.querySelector('input[id="numberOfInterviews"]');

    expect(input.value).toEqual('100');
    expect(component.form.value).toEqual({ numberOfInterviews: '100', numberOfInterviewsKnown: null });
  });

  it('should pre select the first radio button if the establishment has a number of interviews value of "None"', async () => {
    const numberOfInterviews = 'None';
    const { component, fixture } = await setup(true, numberOfInterviews);

    const radioButton = fixture.nativeElement.querySelector('input[id="numberOfInterviewsKnown-0"]');

    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({ numberOfInterviews: null, numberOfInterviewsKnown: 'None' });
  });

  it(`should pre select the second radio button if the establishment has a number of interviews value of "Don't know"`, async () => {
    const numberOfInterviews = `Don't know`;
    const { component, fixture } = await setup(true, numberOfInterviews);

    const radioButton = fixture.nativeElement.querySelector('input[id="numberOfInterviewsKnown-1"]');

    expect(radioButton.checked).toBeTruthy();
    expect(component.form.value).toEqual({ numberOfInterviews: null, numberOfInterviewsKnown: `Don't know` });
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar when in the recruitment flow', async () => {
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

  describe('submit buttons and submitting form', () => {
    it(`should show 'Save and continue' cta button and 'Skip this question' link`, async () => {
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

    it('should call the updateSingleEstablishmentField when submitting form with the amount spent filled out', async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

      const input = getByLabelText('Number of people interviewed');
      userEvent.type(input, '440');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        property: 'peopleInterviewedInTheLastFourWeeks',
        value: '440',
      });
    });

    it('should call the updateSingleEstablishmentField when submitting form with a radio button selected', async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

      const radio = getByLabelText('Nobody has been interviewed in the last 4 weeks');
      fireEvent.click(radio);
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        property: 'peopleInterviewedInTheLastFourWeeks',
        value: 'None',
      });
    });

    it('should navigate to the staff-recruitment-capture-training-requirement page when submitting from the flow', async () => {
      const { fixture, getByText, routerSpy } = await setup(false);

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-recruitment-capture-training-requirement',
      ]);
    });

    it('should navigate to the next page when skip the question', async () => {
      const { fixture, getByText, routerSpy, component } = await setup();

      component.return = null;
      fixture.detectChanges();

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-recruitment-capture-training-requirement',
      ]);
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

    it('should navigate to the summary page when submitting', async () => {
      const { fixture, getByText, routerSpy } = await setup();

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });
  });

  describe('errors', () => {
    let errorMessage;

    beforeEach(() => {
      errorMessage = 'Number of people interviewed must be a positive whole number, like 7';
    });

    it('should show an error if text is inputted into the number of people interviewed input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Number of people interviewed');
      userEvent.type(input, 'text');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a negative number is inputted into the number of people interviewed input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Number of people interviewed');
      userEvent.type(input, '-100');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a negative decimal number is inputted into the number of people interviewed input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Number of people interviewed');
      userEvent.type(input, '-100.30');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a number with no numbers after the decimal point is inputted into the number of people interviewed input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Number of people interviewed');
      userEvent.type(input, '100.');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a mixture of numbers and text is inputted into the number of people interviewed input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Number of people interviewed');
      userEvent.type(input, '100.asdf.314');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      expect(getAllByText(errorMessage).length).toEqual(2);
    });

    it('should show an error if a decimal number with more than 2 decimals is inputted into the number of people interviewed input', async () => {
      const { fixture, getByText, getByLabelText, getAllByText } = await setup();

      const input = getByLabelText('Number of people interviewed');
      userEvent.type(input, '100.3');
      fixture.detectChanges();

      const button = getByText('Save and return');
      fireEvent.click(button);

      expect(getAllByText(errorMessage).length).toEqual(2);
    });
  });
});
