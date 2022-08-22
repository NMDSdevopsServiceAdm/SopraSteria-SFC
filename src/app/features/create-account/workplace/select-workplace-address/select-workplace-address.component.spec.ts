import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { SelectWorkplaceAddressDirective } from '@shared/directives/create-workplace/select-workplace-address/select-workplace-address.directive';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { RegistrationModule } from '../../../registration/registration.module';
import { SelectWorkplaceAddressComponent } from './select-workplace-address.component';

describe('SelectWorkplaceAddressComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(SelectWorkplaceAddressComponent, {
      imports: [
        SharedModule,
        RegistrationModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        SelectWorkplaceAddressDirective,
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
                    path: 'registration',
                  },
                ],
              },
            },
          },
        },
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
    const { getAllByText } = await setup();

    const title = 'Select your workplace address';

    expect(getAllByText(title)).toBeTruthy();
  });

  it('should display postcode retrieved from registration service at top and in each workplace address in dropdown(2)', async () => {
    const { getAllByText } = await setup();

    const retrievedPostcode = 'ABC 123';

    expect(getAllByText(retrievedPostcode, { exact: false }).length).toBe(3);
  });

  it('should display number of addresses found which match postcode(2)', async () => {
    const { getByText } = await setup();

    const noOfAddressesMessage = '2 addresses found';

    expect(getByText(noOfAddressesMessage, { exact: false })).toBeTruthy();
  });

  it('should prefill form with selected location address if it exists by using its index in locationAddresses', async () => {
    const { component } = await setup();
    const form = component.form;

    expect(form.value.address).toBe(0);
    expect(form.invalid).toBeFalsy();
  });

  describe('Error messages', () => {
    it('should display none selected error message(twice) when no address selected in dropdown on clicking Continue', async () => {
      const { component, fixture, getAllByText, queryByText, getByText } = await setup();

      component.registrationService.selectedLocationAddress$ = new BehaviorSubject(null);
      component.ngOnInit();
      fixture.detectChanges();

      const errorMessage = `Select your workplace address if it's listed`;
      expect(queryByText(errorMessage, { exact: false })).toBeNull();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      const form = component.form;
      expect(form.invalid).toBeTruthy();
      expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
    });
  });

  describe('onLocationChange()', () => {
    it('should update selectedLocationAddress$ in workplace service to have currently selected address', async () => {
      const { component } = await setup();

      const expectedSelectedLocationAddress = {
        postalCode: 'ABC 123',
        addressLine1: '2 Street',
        county: 'Greater Manchester',
        locationName: 'Test Care Home',
        townCity: 'Manchester',
        locationId: '12345',
      };

      component.onLocationChange(1);

      expect(component.registrationService.selectedLocationAddress$.value).toEqual(expectedSelectedLocationAddress);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to the find-workplace-address url in registration flow when Change clicked', async () => {
      const { getByText } = await setup();

      const changeButton = getByText('Change');

      expect(changeButton.getAttribute('href')).toBe('/registration/find-workplace-address');
    });

    it('should navigate to workplace-name-address url in registration flow when workplace not listed button clicked', async () => {
      const { getByText } = await setup();

      const notDisplayedButton = getByText('Workplace address is not listed or is not correct');

      expect(notDisplayedButton.getAttribute('href')).toBe('/registration/workplace-name-address');
    });

    it('should navigate to type-of-employer url in registration flow when workplace with name selected and Continue clicked', async () => {
      const { component, spy, getByText, fixture } = await setup();
      const form = component.form;
      const continueButton = getByText('Continue');
      component.selectedLocationAddress.locationName = 'Name';

      form.controls['address'].setValue('1');
      form.controls['address'].markAsDirty();
      fixture.detectChanges();
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();

      expect(spy).toHaveBeenCalledWith(['/registration/type-of-employer']);
    });

    it('should navigate to the confirm-details page in registration flow when workplace selected, Continue clicked and returnToConfirmDetails is not null', async () => {
      const { component, spy, getByText } = await setup();

      component.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };

      const form = component.form;
      form.controls['address'].setValue('1');
      form.controls['address'].markAsDirty();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();
      expect(spy).toHaveBeenCalledWith(['/registration/confirm-details']);
    });

    it('should navigate to workplace-name url in registration flow when workplace without name selected and Continue clicked', async () => {
      const { component, spy, getByText, fixture } = await setup();
      const form = component.form;
      const continueButton = getByText('Continue');
      component.selectedLocationAddress.locationName = null;

      form.controls['address'].setValue('1');
      form.controls['address'].markAsDirty();
      fixture.detectChanges();
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();

      expect(spy).toHaveBeenCalledWith(['/registration/workplace-name']);
    });
  });
});
