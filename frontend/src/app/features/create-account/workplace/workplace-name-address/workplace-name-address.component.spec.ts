import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { WorkplaceNameAddressComponent } from '@features/create-account/workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceModule } from '@features/workplace/workplace.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

describe('WorkplaceNameAddressComponent', () => {
  async function setup(registrationFlow = true) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId, queryByTestId } = await render(
      WorkplaceNameAddressComponent,
      {
        imports: [
          SharedModule,
          WorkplaceModule,
          RouterTestingModule,
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          {
            provide: RegistrationService,
            useClass: MockRegistrationService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                parent: {
                  url: [
                    {
                      path: registrationFlow ? 'registration' : 'confirm-details',
                    },
                  ],
                },
              },
            },
          },
          UntypedFormBuilder,
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct title', async () => {
    const { fixture, getByText } = await setup();
    const expectedTitle = `What's your workplace name and address?`;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getByText(expectedTitle, { exact: false })).toBeTruthy();
    });
  });

  describe('preFillForm()', () => {
    it('should prefill the workplace name and address if manuallyEnteredWorkplace is true', async () => {
      const { component, fixture, getByText } = await setup();

      const spy = spyOn(component, 'preFillForm').and.callThrough();

      component.registrationService.manuallyEnteredWorkplace$ = new BehaviorSubject(true);
      component.ngOnInit();
      component.setupPreFillForm();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      fixture.whenStable().then(() => {
        expect(spy).toHaveBeenCalled();
        expect(component.form.value).toEqual({
          workplaceName: 'Workplace Name',
          address1: '1 Street',
          address2: 'Second Line',
          address3: 'Third Line',
          townOrCity: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'ABC 123',
        });
      });
    });

    it('should prefill the workplace name and address if returnToConfirmDetails is true', async () => {
      const { component, fixture, getByText } = await setup();

      const spy = spyOn(component, 'preFillForm').and.callThrough();

      component.registrationService.returnTo$ = new BehaviorSubject({ url: ['registration', 'confirm-details'] });
      component.ngOnInit();
      component.setupPreFillForm();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      fixture.whenStable().then(() => {
        expect(spy).toHaveBeenCalled();
        expect(component.form.value).toEqual({
          workplaceName: 'Workplace Name',
          address1: '1 Street',
          address2: 'Second Line',
          address3: 'Third Line',
          townOrCity: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'ABC 123',
        });
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to type-of-employer page on success', async () => {
      const { component, fixture, getByText, spy } = await setup();
      const form = component.form;

      form.controls['workplaceName'].setValue('Workplace');
      form.controls['address1'].setValue('1 Main Street');
      form.controls['townOrCity'].setValue('London');
      form.controls['county'].setValue('Greater London');
      form.controls['postcode'].setValue('SE1 1AA');

      fixture.detectChanges();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeFalsy();
      expect(spy).toHaveBeenCalledWith(['registration', 'type-of-employer']);
    });

    it('should show the continue button when inside the flow', async () => {
      const { getByText } = await setup();

      expect(getByText('Continue')).toBeTruthy();
    });

    it('should show the Save and return button and a cancel link when inside the flow', async () => {
      const { component, fixture, getByText } = await setup();

      component.insideFlow = false;
      fixture.detectChanges();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should navigate to confirm-details page on success if returnToConfirmDetails is not null', async () => {
      const { component, fixture, getByText, spy } = await setup(false);
      const form = component.form;

      form.controls['workplaceName'].setValue('Workplace');
      form.controls['address1'].setValue('1 Main Street');
      form.controls['townOrCity'].setValue('London');
      form.controls['county'].setValue('Greater London');
      form.controls['postcode'].setValue('SE1 1AA');

      component.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };
      fixture.detectChanges();

      const continueButton = getByText('Save and return');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeFalsy();
      expect(spy).toHaveBeenCalledWith(['registration/confirm-details']);
    });
  });

  describe('Error messages', () => {
    it(`should display an error message when workplace name isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the name of your workplace';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when building and street isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the building (number or name) and street';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when town or city isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the town or city';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when county isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the county';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when postcode isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the postcode';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it('should display an error message when an invalid postcode is entered', async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter a valid workplace postcode';

      form.controls['postcode'].setValue('M1');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when workplace name exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Workplace name must be 120 characters or fewer';

      form.controls['workplaceName'].setValue(
        'Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Long Workplace Name',
      );
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when address 1 exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Building (number or name) and street must be 40 characters or fewer';

      form.controls['address1'].setValue('Long Workplace Building Name Or Number And Street');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when town or city exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Town or city must be 40 characters or fewer';

      form.controls['townOrCity'].setValue('Very Very Very Very Long Town Or City Name');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when county exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'County must be 40 characters or fewer';

      form.controls['county'].setValue('Very Very Very Very Very Long County Name');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when postcode exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Postcode must be 8 characters or fewer';

      form.controls['postcode'].setValue('AB12 34CD');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when address 2 exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'This line must be 40 characters or fewer';

      form.controls['address2'].setValue('Long Workplace Building Name Or Number And Street');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when address 3 exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'This line must be 40 characters or fewer';

      form.controls['address3'].setValue('Long Workplace Building Name Or Number And Street');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });
  });

  describe('progressBar', () => {
    it('should render the workplace and user account progress bars', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar-1')).toBeTruthy();
      expect(getByTestId('progress-bar-2')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
      expect(queryByTestId('progress-bar-2')).toBeFalsy();
    });
  });
});
