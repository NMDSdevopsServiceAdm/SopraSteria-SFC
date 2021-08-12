import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { IsThisYourWorkplaceComponent } from './is-this-your-workplace.component';

describe('IsThisYourWorkplaceComponent', () => {
  async function setup(searchMethod = 'locationID') {
    const primaryWorkplace = { isParent: true };
    const component = await render(IsThisYourWorkplaceComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        RegistrationModule,
        ReactiveFormsModule,
      ],
      providers: [
        BackService,
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
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
              value: searchMethod,
            },
            selectedLocationAddress$: new BehaviorSubject(null),
            manuallyEnteredWorkplace$: new BehaviorSubject(null),
            returnTo$: new BehaviorSubject(null),
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
                    path: 'add-workplace',
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
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the correct heading when in the parent journey', async () => {
    const { component } = await setup();

    const parentHeading = component.queryByText('Is this the workplace you want to add?');
    const registrationHeading = component.queryByText('Is this your workplace?');

    expect(parentHeading).toBeTruthy();
    expect(registrationHeading).toBeFalsy();
  });

  it('should render the correct reveal title when in the parent journey', async () => {
    const { component } = await setup();

    const revealTitle = 'Spotted a mistake in the workplace details?';

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
    const { component } = await setup('postcode');

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

  it('should navigate to the select-main-serice url when selecting yes', async () => {
    const { component, spy } = await setup();

    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'new-select-main-service']);
  });

  it('should navigate to the confirm-workplace-details page when selecting yes if returnToConfirmDetails is not null', async () => {
    const { component, spy } = await setup();

    component.fixture.componentInstance.returnToConfirmDetails = {
      url: ['add-workplace', 'confirm-workplace-details'],
    };

    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'confirm-workplace-details']);
  });

  it('should navigate back to find-workplace url when selecting no', async () => {
    const { component, spy } = await setup();

    const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
    fireEvent.click(noRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'find-workplace']);
  });

  it('should display an error when continue is clicked without selecting anything', async () => {
    const { component } = await setup();

    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);
    const errorMessage = 'Select yes if this is the workplace you want to add';

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage).length).toBe(2);
  });

  describe('setBackLink()', () => {
    it('should set the correct back link when in the parent flow', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'find-workplace'],
      });
    });
  });
});
