import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { IsThisYourWorkplaceComponent } from './is-this-your-workplace.component';

describe('IsThisYourWorkplaceComponent', () => {
  async function setup(flow) {
    let primaryWorkplace = {};
    if (flow === 'add-workplace') {
      primaryWorkplace = { isParent: true };
    }
    const component = await render(IsThisYourWorkplaceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
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
          },
        },
        {
          provide: EstablishmentService,
          useValue: { primaryWorkplace },
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
                    path: flow,
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

    return {
      component,
      router,
      spy,
    };
  }

  it('should render a IsThisYourWorkplaceComponent', async () => {
    const { component } = await setup('registration');
    expect(component).toBeTruthy();
  });

  describe('Registration journey', () => {
    it('should render the correct heading when in the registration journey', async () => {
      const { component } = await setup('registration');

      const registrationHeading = component.queryByText('Is this your workplace?');
      const parentHeading = component.queryByText('Is this your workplace you want to add?');

      expect(registrationHeading).toBeTruthy();
      expect(parentHeading).toBeFalsy();
    });

    it('should show the id and address when given the locationId', async () => {
      const { component } = await setup('registration');

      const locationIdText = component.queryByText('1-2123313123');
      const locationName = component.queryByText('Hello Care');
      const addressLine1 = component.queryByText('123 Fake Ave');
      const county = component.queryByText('West Yorkshire');
      const townCity = component.queryByText('Leeds');
      const postalCode = component.queryByText('LS1 1AA');

      expect(locationIdText).toBeTruthy();
      expect(locationName).toBeTruthy();
      expect(addressLine1).toBeTruthy();
      expect(county).toBeTruthy();
      expect(townCity).toBeTruthy();
      expect(postalCode).toBeTruthy();
    });

    it('should navigate to the select-main-serice url when selecting yes', async () => {
      const { component, spy } = await setup('registration');

      const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration', 'select-main-service']);
    });

    it('should navigate back to find-workplace url when selecting no', async () => {
      const { component, spy } = await setup('registration');

      const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration', 'find-workplace']);
    });

    it('should display an error when continue is clicked without selecting anything', async () => {
      const { component } = await setup('registration');

      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);
      const errorMessage = 'Select yes if this is your workplace';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });
  });

  describe('Parent journey', () => {
    it('should render the correct heading when in the parent journey', async () => {
      const { component } = await setup('add-workplace');

      const parentHeading = component.queryByText('Is this the workplace you want to add?');
      const registrationHeading = component.queryByText('Is this your workplace?');

      expect(parentHeading).toBeTruthy();
      expect(registrationHeading).toBeFalsy();
    });

    it('should show the id and address when given the locationId', async () => {
      const { component } = await setup('add-workplace');

      const locationIdText = component.queryByText('1-2123313123');
      const locationName = component.queryByText('Hello Care');
      const addressLine1 = component.queryByText('123 Fake Ave');
      const county = component.queryByText('West Yorkshire');
      const townCity = component.queryByText('Leeds');
      const postalCode = component.queryByText('LS1 1AA');

      expect(locationIdText).toBeTruthy();
      expect(locationName).toBeTruthy();
      expect(addressLine1).toBeTruthy();
      expect(county).toBeTruthy();
      expect(townCity).toBeTruthy();
      expect(postalCode).toBeTruthy();
    });

    it('should navigate to the select-main-serice url when selecting yes', async () => {
      const { component, spy } = await setup('add-workplace');

      const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['add-workplace', 'select-main-service']);
    });

    it('should navigate back to find-workplace url when selecting no', async () => {
      const { component, spy } = await setup('add-workplace');

      const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['add-workplace', 'find-workplace']);
    });

    it('should display an error when continue is clicked without selecting anything', async () => {
      const { component } = await setup('add-workplace');

      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);
      const errorMessage = 'Select yes if this is your workplace';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });
  });

  describe('setBackLink()', () => {
    it('should set the correct back link when in the registration flow', async () => {
      const { component } = await setup('registration');
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'find-workplace'],
      });
    });

    it('should set the correct back link when in the parent flow', async () => {
      const { component } = await setup('add-workplace');
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'find-workplace'],
      });
    });
  });
});
