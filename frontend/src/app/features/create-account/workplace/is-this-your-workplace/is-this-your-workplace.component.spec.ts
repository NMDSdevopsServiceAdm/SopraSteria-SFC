import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { IsThisYourWorkplaceComponent } from './is-this-your-workplace.component';

describe('IsThisYourWorkplaceComponent', () => {
  async function setup(overrides: any = {}) {
    const component = await render(IsThisYourWorkplaceComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: RegistrationService,
          useValue: {
            locationAddresses$: {
              value: [
                {
                  locationName: 'Hello Care',
                  locationId: '1-2123313123',
                  addressLine1: '123 Fake Ave',
                  county: 'West Yorkshire',
                  postalCode: 'LS1 1AA',
                  townCity: 'Leeds',
                },
              ],
            },
            searchMethod$: {
              value: overrides.searchMethod ?? 'locationID',
            },
            selectedLocationAddress$: {
              value: {
                locationId: overrides.locationId ?? null,
              },
              next: () => {
                return true;
              },
            },
            manuallyEnteredWorkplace$: new BehaviorSubject(null),
            returnTo$: new BehaviorSubject(null),
            checkIfEstablishmentExists: () => {
              return;
            },
          },
        },
        {
          provide: EstablishmentService,
          useValue: {},
        },
        {
          provide: LocationService,
          useClass: MockLocationService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: overrides.registrationFlow ?? true ? 'registration' : 'confirm-details',
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
    const registrationService = injector.inject(RegistrationService) as RegistrationService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      spy,
      registrationService,
    };
  }

  it('should render a IsThisYourWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace and user account progress bars', async () => {
    const { component } = await setup();

    expect(component.getByTestId('progress-bar-1')).toBeTruthy();
    expect(component.getByTestId('progress-bar-2')).toBeTruthy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
    const overrides = { searchMethod: 'locationID', locationId: '1-2123313123', registrationFlow: false };
    const { component } = await setup(overrides);

    expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
    expect(component.queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should render the correct heading when in the registration journey', async () => {
    const { component } = await setup();

    const registrationHeading = component.queryByText('Is this your workplace?');
    const parentHeading = component.queryByText('Is this the workplace you want to add?');

    expect(registrationHeading).toBeTruthy();
    expect(parentHeading).toBeFalsy();
  });

  it('should render the correct reveal title when in the registration journey', async () => {
    const { component } = await setup();

    const revealTitle = 'Spotted a mistake in your workplace details?';

    expect(component.queryByText(revealTitle)).toBeTruthy();
  });

  it('should show the id and address when given the locationId', async () => {
    const { component } = await setup();

    const messageText = component.queryByText('CQC location ID entered:');
    const locationIdText = component.queryByText('1-2123313123');
    const locationName = component.queryByText('Hello Care');
    const addressLine1 = component.queryByText('123 Fake Ave');
    const county = component.queryByText('West Yorkshire');
    const townCity = component.queryByText('Leeds');
    const postalCode = component.queryByText('LS1 1AA');

    expect(messageText).toBeTruthy();
    expect(locationIdText).toBeTruthy();
    expect(locationName).toBeTruthy();
    expect(addressLine1).toBeTruthy();
    expect(county).toBeTruthy();
    expect(townCity).toBeTruthy();
    expect(postalCode).toBeTruthy();
  });

  it('should show the postcode and address when given the postcode', async () => {
    const { component } = await setup({ searchMethod: 'postcode' });

    const messageText = component.queryByText('Postcode entered:');
    const locationName = component.queryByText('Hello Care');
    const addressLine1 = component.queryByText('123 Fake Ave');
    const county = component.queryByText('West Yorkshire');
    const townCity = component.queryByText('Leeds');
    const postalCode = component.queryAllByText('LS1 1AA');

    expect(messageText).toBeTruthy();
    expect(locationName).toBeTruthy();
    expect(addressLine1).toBeTruthy();
    expect(county).toBeTruthy();
    expect(townCity).toBeTruthy();
    expect(postalCode.length).toBe(2);
  });

  it('should preselect the "Yes" radio button if selectedLocationAddress is the same as the location data', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.registrationService.selectedLocationAddress$.value.locationId = '123';
    component.fixture.componentInstance.locationData.locationId = '123';
    component.fixture.componentInstance.ngOnInit();

    const form = component.fixture.componentInstance.form;
    expect(form.valid).toBeTruthy();
    expect(form.value.yourWorkplace).toBe('yes');
  });

  it('should call the establishmentExistsCheck when selecting yes', async () => {
    const { component, registrationService } = await setup();

    const registrationSpy = spyOn(registrationService, 'checkIfEstablishmentExists').and.returnValue(
      of({ exists: false }),
    );

    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    component.fixture.detectChanges();
    expect(registrationSpy).toHaveBeenCalledWith('1-2123313123');
  });

  it('should navigate to the cannot-create-account url when selecting yes, if the establishment already exists in the service', async () => {
    const { component, spy, registrationService } = await setup();

    spyOn(registrationService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: true }));

    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'cannot-create-account'], {
      state: { returnTo: 'registration/your-workplace' },
    });
  });

  it('should navigate to the type-of-employer url when selecting yes and the establishment does not already exist in the service', async () => {
    const { component, spy, registrationService } = await setup();

    spyOn(registrationService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: false }));

    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'type-of-employer']);
  });

  it('should navigate to the confirm-details page when selecting yes when returnToConfirmDetails is not null and the establishment does not already exist in the service', async () => {
    const overrides = { searchMethod: 'locationID', locationId: '1-2123313123', registrationFlow: false };
    const { component, spy, registrationService } = await setup(overrides);

    component.fixture.componentInstance.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };

    spyOn(registrationService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: false }));

    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration/confirm-details']);
  });

  it('should navigate to the problem-with-the-service url when there is a problem with the checkIfEstablishmentExists call', async () => {
    const { component, spy, registrationService } = await setup();

    spyOn(registrationService, 'checkIfEstablishmentExists').and.returnValue(throwError('error'));

    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['/problem-with-the-service']);
  });

  it('should navigate back to find-workplace url when selecting no', async () => {
    const { component, spy } = await setup();

    const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
    fireEvent.click(noRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'find-workplace']);
  });

  it('should display an error when continue is clicked without selecting anything', async () => {
    const overrides = { searchMethod: 'locationID', locationId: null };
    const { component } = await setup(overrides);

    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);
    const errorMessage = 'Select yes if this is your workplace';

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage).length).toBe(2);
  });
});
