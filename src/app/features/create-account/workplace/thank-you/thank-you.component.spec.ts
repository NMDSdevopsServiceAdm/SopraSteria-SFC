import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocationService } from '@core/services/location.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ThankYouComponent } from './thank-you.component';

describe('ThankYouComponent', () => {
  async function setup() {
    const component = await render(ThankYouComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
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
    const componentInstance = component.fixture.componentInstance;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      componentInstance,
      spy,
    };
  }

  it('should render a ThankYouComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should say thank you', async () => {
    const { component } = await setup();
    expect(component.getByText('Thank you')).toBeTruthy();
  });

  it(`should display the reveal`, async () => {
    const { component } = await setup();

    expect(component.getByText('Contact us if you have any questions.')).toBeTruthy();
  });

  it('should reset registration service', async () => {
    const { component } = await setup();

    const registrationService = component.fixture.componentInstance.registrationService;

    expect(registrationService.registrationInProgress$.value).toBeFalse();
    expect(registrationService.loginCredentials$.value).toBeNull();
    expect(registrationService.securityDetails$.value).toBeNull();
    expect(registrationService.termsAndConditionsCheckbox$.value).toBeFalse();

    expect(registrationService.isRegulated$.value).toBeNull();
    expect(registrationService.locationAddresses$.value).toBeNull();
    expect(registrationService.isCqcRegulated$.value).toBeNull();
    expect(registrationService.newWorkplaceUid).toBeNull();
    expect(registrationService.selectedLocationAddress$.value).toBeNull();
    expect(registrationService.selectedWorkplaceService$.value).toBeNull();
    expect(registrationService.manuallyEnteredWorkplace$.value).toBeNull();
    expect(registrationService.searchMethod$.value).toBeNull();
    expect(registrationService.postcodeOrLocationId$.value).toBeNull();
    expect(registrationService.postcode$.value).toBeNull();
    expect(registrationService.workplaceNotFound$.value).toBeFalse();
    expect(registrationService.returnTo$.value).toBeNull();
    expect(registrationService.invalidPostcodeEntered$.value).toBeNull();
    expect(registrationService.manuallyEnteredWorkplaceName$.value).toBeFalse();
    expect(registrationService.useDifferentLocationIdOrPostcode$.value).toBeNull();
  });
});
