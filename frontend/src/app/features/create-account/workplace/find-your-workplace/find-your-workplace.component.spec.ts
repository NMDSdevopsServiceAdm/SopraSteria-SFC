import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject, throwError } from 'rxjs';

import { FindYourWorkplaceComponent } from './find-your-workplace.component';

describe('FindYourWorkplaceComponent', () => {
  async function setup(registrationFlow = true) {
    const component = await render(FindYourWorkplaceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        {
          provide: LocationService,
          useClass: MockLocationService,
        },
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
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const componentInstance = component.fixture.componentInstance;
    const locationService = injector.inject(LocationService) as LocationService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      componentInstance,
      locationService,
      spy,
    };
  }

  it('should render a FindYourWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace and user account progress bars', async () => {
    const { component } = await setup();

    expect(component.getByTestId('progress-bar-1')).toBeTruthy();
    expect(component.getByTestId('progress-bar-2')).toBeTruthy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
    const { component } = await setup(false);

    expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
    expect(component.queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should prefill the form if postcodeOrLocationId is already set in the service', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.registrationService.postcodeOrLocationId$ = new BehaviorSubject('AB1 2CD');
    component.fixture.componentInstance.ngOnInit();

    const form = component.fixture.componentInstance.form;
    expect(form.value.postcodeOrLocationID).toEqual('AB1 2CD');
    expect(form.valid).toBeTruthy();
  });

  it('should show registration flow title', async () => {
    const { component } = await setup();
    const title = 'Find your workplace';
    expect(component.getByText(title)).toBeTruthy();
  });

  it('should show registration flow hint message', async () => {
    const { component } = await setup();
    const hint = `We'll use your CQC location ID or workplace postcode to find your workplace in the Care Quality Commision database.`;
    expect(component.getByText(hint)).toBeTruthy();
  });

  it('should not lookup workplaces the form if the input is empty', async () => {
    const { component, locationService } = await setup();
    const getLocationByPostcodeOrLocationID = spyOn(
      locationService,
      'getLocationByPostcodeOrLocationID',
    ).and.callThrough();

    const findWorkplaceButton = component.getByTestId('button');
    fireEvent.click(findWorkplaceButton);

    expect(getLocationByPostcodeOrLocationID).not.toHaveBeenCalled();
  });

  it('should show an error if it has special characters other than a hyphen', async () => {
    const { component, locationService } = await setup();
    const getLocationByPostcodeOrLocationID = spyOn(
      locationService,
      'getLocationByPostcodeOrLocationID',
    ).and.callThrough();

    const form = component.fixture.componentInstance.form;
    form.controls['postcodeOrLocationID'].setValue('http://localhost');

    const findWorkplaceButton = component.getByTestId('button');
    fireEvent.click(findWorkplaceButton);

    expect(getLocationByPostcodeOrLocationID).not.toHaveBeenCalled();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Enter a valid CQC location ID or workplace postcode', { exact: false }).length).toBe(
      2,
    );
  });

  it('should show registration version of error message if the input is empty on submit', async () => {
    const { component } = await setup();

    const findWorkplaceButton = component.getByTestId('button');
    fireEvent.click(findWorkplaceButton);

    const form = component.fixture.componentInstance.form;
    expect(form.invalid).toBeTruthy();
    expect(
      component.getAllByText('Enter your CQC location ID or your workplace postcode', { exact: false }).length,
    ).toBe(2);
  });

  it('should submit the value if a postcode is inputted', async () => {
    const { component, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByTestId('button');
    const getLocationByPostcodeOrLocationID = spyOn(
      locationService,
      'getLocationByPostcodeOrLocationID',
    ).and.callThrough();

    form.controls['postcodeOrLocationID'].setValue('LS1 1AA');

    fireEvent.click(findWorkplaceButton);

    component.fixture.detectChanges();

    expect(form.valid).toBeTruthy();
    expect(getLocationByPostcodeOrLocationID).toHaveBeenCalledWith('LS1 1AA');
  });

  it('should submit the value if a locationID is inputted', async () => {
    const { component, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByTestId('button');
    const getLocationByPostcodeOrLocationID = spyOn(
      locationService,
      'getLocationByPostcodeOrLocationID',
    ).and.callThrough();

    form.controls['postcodeOrLocationID'].setValue('1-123456789');

    fireEvent.click(findWorkplaceButton);

    component.fixture.detectChanges();

    expect(form.valid).toBeTruthy();
    expect(getLocationByPostcodeOrLocationID).toHaveBeenCalledWith('1-123456789');
  });

  it('should submit and go to your-workplace if there is only one address', async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByTestId('button');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AA');

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'your-workplace']);
  });

  it('should submit and go to select-workplace if there is more than one address', async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByTestId('button');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AB');

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'select-workplace']);
  });

  it('should submit and go to workplace-not-found if there are no addresses', async () => {
    const { component, spy, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByTestId('button');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AB');

    const errorResponse = new HttpErrorResponse({
      error: { code: `some code`, message: `some message.` },
      status: 404,
      statusText: 'Not found',
    });

    spyOn(locationService, 'getLocationByPostcodeOrLocationID').and.returnValue(throwError(errorResponse));

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'workplace-not-found']);
  });

  it('should show error if server fails with 500 code', async () => {
    const { component, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByTestId('button');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AB');

    const errorResponse = new HttpErrorResponse({
      error: { code: `some code`, message: `some message.` },
      status: 500,
      statusText: 'Server error',
    });

    spyOn(locationService, 'getLocationByPostcodeOrLocationID').and.returnValue(throwError(errorResponse));

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(component.getAllByText('Server Error. code 500', { exact: false })).toBeTruthy();
  });
});
