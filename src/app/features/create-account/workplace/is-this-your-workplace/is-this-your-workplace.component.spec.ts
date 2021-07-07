import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { IsThisYourWorkplaceComponent } from './is-this-your-workplace.component';

fdescribe('IsThisYourWorkplaceComponent', () => {
  async function setup() {
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
    // const componentInstance = component.fixture.componentInstance;
    // const locationService = injector.inject(LocationService) as LocationService;
    // const errorResponse = new HttpErrorResponse({
    //   error: { code: `some code`, message: `some message.` },
    //   status: 404,
    //   statusText: 'Not found',
    // });

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      // componentInstance,
      // locationService,
      spy,
    };
  }

  it('should render a IsThisYourWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the id and address when given the locationId', async () => {
    const { component } = await setup();

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
    const { component, spy } = await setup();

    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'select-main-service']);
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
    const { component } = await setup();

    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);
    const errorMessage = 'Select yes if this is your workplace';

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage).length).toBe(2);
  });
});
