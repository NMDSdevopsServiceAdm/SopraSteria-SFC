import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { LocationService } from '@core/services/location.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { throwError } from 'rxjs';

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

  it('should not lookup workplaces the form if the input is empty', async () => {
    const { component, locationService } = await setup();
    const findWorkplaceButton = component.getByText('Find workplace');
    const getLocationByPostcodeOrLocationID = spyOn(
      locationService,
      'getLocationByPostcodeOrLocationID',
    ).and.callThrough();

    fireEvent.click(findWorkplaceButton);

    component.fixture.detectChanges();

    expect(getLocationByPostcodeOrLocationID).not.toHaveBeenCalled();
  });

  it('should show error the form if the input is empty', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    fireEvent.click(findWorkplaceButton);

    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(
      component.getAllByText('Enter your CQC location ID or your workplace postcode', { exact: false }).length,
    ).toBe(2);
  });

  it('should submit the value if value is inputted', async () => {
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

    expect(spy).toHaveBeenCalledWith(['registration', 'new-workplace-not-found']);
  });

  it("should show error if server 503's", async () => {
    const { component, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AB');

    const errorResponse = new HttpErrorResponse({
      error: { code: `some code`, message: `some message.` },
      status: 503,
      statusText: 'Server error',
    });

    spyOn(locationService, 'getLocationByPostcodeOrLocationID').and.returnValue(throwError(errorResponse));

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(component.getAllByText('Server Error. code 503', { exact: false })).toBeTruthy();
  });

  describe('setBackLink', () => {
    it('should set the back link to `regulated-by-cqc` when returnToWorkplaceNotFound is set to false', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');
      component.fixture.componentInstance.returnToWorkplaceNotFound = false;
      component.fixture.detectChanges();

      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'new-regulated-by-cqc'],
      });
    });

    it('should set the back link to `workplace-not-found` when returnToWorkplaceNotFound is set to true', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');
      component.fixture.componentInstance.returnToWorkplaceNotFound = true;
      component.fixture.detectChanges();

      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'new-workplace-not-found'],
      });
    });

    it('should set the back link to `confirm-details` when returnToConfirmDetails is not null and feature flag is on', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.createAccountNewDesign = true;
      component.fixture.componentInstance.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };
      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'confirm-details'],
      });
    });
  });
});
