import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { WorkplaceNameAddressComponent } from '@features/create-account/workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceModule } from '@features/workplace/workplace.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

describe('WorkplaceNameAddressComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(WorkplaceNameAddressComponent, {
      imports: [
        SharedModule,
        WorkplaceModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        RegistrationService,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: 'registration',
                  },
                ],
              },
            },
          },
        },
        FormBuilder,
      ],
    });

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
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct title', async () => {
    const { getByText } = await setup();
    const expectedTitle = `What's your workplace name and address?`;

    expect(getByText(expectedTitle, { exact: false })).toBeTruthy();
  });

  it('should navigate to new-select-main-service page on success if feature flag is on', async () => {
    const { component, fixture, getByText, spy } = await setup();
    const form = component.form;

    form.controls['workplaceName'].setValue('Workplace');
    form.controls['address1'].setValue('1 Main Street');
    form.controls['townOrCity'].setValue('London');
    form.controls['county'].setValue('Greater London');
    form.controls['postcode'].setValue('SE1 1AA');

    component.createAccountNewDesign = true;
    fixture.detectChanges();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeFalsy();
    expect(spy).toHaveBeenCalledWith(['/registration', 'new-select-main-service']);
  });

  it('should navigate to select-main-service page on success if feature flag is off', async () => {
    const { component, fixture, getByText, spy } = await setup();
    const form = component.form;

    form.controls['workplaceName'].setValue('Workplace');
    form.controls['address1'].setValue('1 Main Street');
    form.controls['townOrCity'].setValue('London');
    form.controls['county'].setValue('Greater London');
    form.controls['postcode'].setValue('SE1 1AA');

    component.createAccountNewDesign = false;
    fixture.detectChanges();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeFalsy();
    expect(spy).toHaveBeenCalledWith(['/registration', 'select-main-service']);
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
      const expectedErrorMessage = 'Building and street must be 40 characters or fewer';

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
  });

  describe('setBackLink', () => {
    it('should set the back link to `workplace-not-found` when isCqcRegulated and workplaceNotFound in service are true', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.registrationService.workplaceNotFound$.next(true);
      component.registrationService.isCqcRegulated$.next(true);
      component.createAccountNewDesign = true;

      component.ngOnInit();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'new-workplace-not-found'],
      });
    });

    it('should set the back link to `workplace-address-not-found` when returnToWorkplaceNotFound is false and returnToCouldNotFindWorkplaceAddress is true', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.registrationService.workplaceNotFound$.next(true);
      component.registrationService.isCqcRegulated$.next(false);
      component.createAccountNewDesign = true;

      component.ngOnInit();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'workplace-address-not-found'],
      });
    });

    it('should set the back link to `select-workplace` when returnToWorkplaceNotFound is false and isCqcRegulated is true', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.registrationService.workplaceNotFound$.next(false);
      component.registrationService.isCqcRegulated$.next(true);
      component.createAccountNewDesign = true;

      component.ngOnInit();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'select-workplace'],
      });
    });

    it('should set the back link to `select-workplace-address` when returnToWorkplaceNotFound and isCqcRegulated are false', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.registrationService.workplaceNotFound$.next(false);
      component.registrationService.isCqcRegulated$.next(false);
      component.createAccountNewDesign = true;

      component.ngOnInit();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'select-workplace-address'],
      });
    });
  });
});
