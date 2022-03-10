import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
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
  async function setup() {
    const component = await render(FindYourWorkplaceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
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

    const findWorkplaceButton = component.getByText('Find workplace');
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

    const findWorkplaceButton = component.getByText('Find workplace');
    fireEvent.click(findWorkplaceButton);

    expect(getLocationByPostcodeOrLocationID).not.toHaveBeenCalled();
    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Enter a valid CQC location ID or workplace postcode', { exact: false }).length).toBe(
      2,
    );
  });

  it('should show registration version of error message if the input is empty on submit', async () => {
    const { component } = await setup();

    const findWorkplaceButton = component.getByText('Find workplace');
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
    const findWorkplaceButton = component.getByText('Find workplace');
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
    const findWorkplaceButton = component.getByText('Find workplace');
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

  it("should submit and go to your-workplace if there's only one address", async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AA');

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'your-workplace']);
  });

  it("should submit and go to select-workplace if there's more than one address", async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AB');

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'select-workplace']);
  });

  it("should submit and go to workplace-not-found if there's no addresses", async () => {
    const { component, spy, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

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

  it("should show error if server 500's", async () => {
    const { component, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

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

  describe('setBackLink', () => {
    it('should set the back link to `regulated-by-cqc` when returnToWorkplaceNotFound is set to false', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');
      component.fixture.componentInstance.returnToWorkplaceNotFound = false;
      component.fixture.detectChanges();

      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'regulated-by-cqc'],
      });
    });

    it('should set the back link to `workplace-not-found` when returnToWorkplaceNotFound is set to true', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');
      component.fixture.componentInstance.returnToWorkplaceNotFound = true;
      component.fixture.detectChanges();

      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'workplace-not-found'],
      });
    });

    it('should set the back link to `confirm-details` when returnToConfirmDetails is not null', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };
      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'confirm-details'],
      });
    });
  });
});
