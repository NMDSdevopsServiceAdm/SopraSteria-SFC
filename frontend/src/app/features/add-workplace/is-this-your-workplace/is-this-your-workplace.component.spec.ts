import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { IsThisYourWorkplaceComponent } from './is-this-your-workplace.component';

describe('IsThisYourWorkplaceComponent', () => {
  async function setup(searchMethod = 'locationID', locationId = '1-2123313123', addWorkplaceFlow = true) {
    const primaryWorkplace = { isParent: true };
    const setupTools = await render(IsThisYourWorkplaceComponent, {
      imports: [SharedModule, RouterModule, RegistrationModule, ReactiveFormsModule],
      providers: [
        BackService,
        {
          provide: WorkplaceService,
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
            selectedLocationAddress$: {
              value: {
                locationId: locationId,
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
                    path: addWorkplaceFlow ? 'add-workplace' : 'confirm-workplace-details',
                  },
                ],
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workplaceService = injector.inject(WorkplaceService) as WorkplaceService;

    const navigateSpy = spyOn(router, 'navigate');
    navigateSpy.and.returnValue(Promise.resolve(true));

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      router,
      navigateSpy,
      workplaceService,
    };
  }

  it('should render a IsThisYourWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace progress bar but not the user progress bar', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should not render the progress bar when accessed from outside the flow', async () => {
    const { queryByTestId } = await setup('locationID', '1-2123313123', false);

    expect(queryByTestId('progress-bar-1')).toBeFalsy();
  });

  it('should render the correct heading when in the parent journey', async () => {
    const { queryByText } = await setup();

    const parentHeading = queryByText('Is this the workplace you want to add?');
    const registrationHeading = queryByText('Is this your workplace?');

    expect(parentHeading).toBeTruthy();
    expect(registrationHeading).toBeFalsy();
  });

  it('should render the correct reveal title when in the parent journey', async () => {
    const { queryByText } = await setup();

    const revealTitle = 'Spotted a mistake in the workplace details?';

    expect(queryByText(revealTitle)).toBeTruthy();
  });

  it('should show the id and address when given the locationId', async () => {
    const { queryByText } = await setup();

    const messageText = queryByText('CQC location ID entered:');
    const locationIdText = queryByText('1-2123313123');
    const locationName = queryByText('Hello Care');
    const addressLine1 = queryByText('123 Fake Ave');
    const county = queryByText('West Yorkshire');
    const townCity = queryByText('Leeds');
    const postalCode = queryByText('LS1 1AA');

    expect(messageText).toBeTruthy();
    expect(locationIdText).toBeTruthy();
    expect(locationName).toBeTruthy();
    expect(addressLine1).toBeTruthy();
    expect(county).toBeTruthy();
    expect(townCity).toBeTruthy();
    expect(postalCode).toBeTruthy();
  });

  it('should show the postcode and address when given the postcode', async () => {
    const { queryByText, queryAllByText } = await setup('postcode');

    const messageText = queryByText('Postcode entered:');
    const locationName = queryByText('Hello Care');
    const addressLine1 = queryByText('123 Fake Ave');
    const county = queryByText('West Yorkshire');
    const townCity = queryByText('Leeds');
    const postalCode = queryAllByText('LS1 1AA');

    expect(messageText).toBeTruthy();
    expect(locationName).toBeTruthy();
    expect(addressLine1).toBeTruthy();
    expect(county).toBeTruthy();
    expect(townCity).toBeTruthy();
    expect(postalCode.length).toBe(2);
  });

  it('should preselect the "Yes" radio button if selectedLocationAddress is the same as location data', async () => {
    const { component } = await setup();

    component.workplaceService.selectedLocationAddress$.value.locationId = '123';
    component.locationData.locationId = '123';
    component.ngOnInit();

    const form = component.form;
    expect(form.valid).toBeTruthy();
    expect(form.value.yourWorkplace).toBe('yes');
  });

  it('should call the establishmentExistsCheck when selecting yes', async () => {
    const { getByText, workplaceService, getByRole, fixture } = await setup();

    const workplaceSpy = spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: false }));

    const yesRadioButton = getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    fixture.detectChanges();
    expect(workplaceSpy).toHaveBeenCalledWith('1-2123313123');
  });

  it('should navigate to the type-of-employer url when selecting yes and the establishment does not already exist in the service', async () => {
    const { navigateSpy, workplaceService, getByRole, getByText } = await setup();

    spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: false }));

    const yesRadioButton = getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(navigateSpy).toHaveBeenCalledWith(['add-workplace', 'type-of-employer']);
  });

  it('should navigate to the confirm-workplace-details page when selecting yes if returnToConfirmDetails is not null and the establishment does not already exist in the service', async () => {
    const { component, getByText, navigateSpy, workplaceService, getByRole } = await setup(
      'locationID',
      '1-2123313123',
      false,
    );

    component.returnToConfirmDetails = {
      url: ['add-workplace', 'confirm-workplace-details'],
    };

    spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: false }));

    const yesRadioButton = getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(navigateSpy).toHaveBeenCalledWith(['add-workplace/confirm-workplace-details']);
  });

  it('should navigate to the problem-with-the-service url when there is a problem with the checkIfEstablishmentExists call', async () => {
    const { getByText, navigateSpy, workplaceService, getByRole } = await setup();

    spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(throwError('error'));

    const yesRadioButton = getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(navigateSpy).toHaveBeenCalledWith(['/problem-with-the-service']);
  });

  it('should navigate back to find-workplace url when selecting no', async () => {
    const { getByText, getByRole, navigateSpy } = await setup();

    const noRadioButton = getByRole('radio', { name: /No/ });
    fireEvent.click(noRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(navigateSpy).toHaveBeenCalledWith(['add-workplace', 'find-workplace']);
  });

  it('should display an error when continue is clicked without selecting anything', async () => {
    const { component, getByText, getAllByText } = await setup('locationID', null);

    const form = component.form;
    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);
    const errorMessage = 'Select yes if this is the workplace you want to add';

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage).length).toBe(2);
  });
});
