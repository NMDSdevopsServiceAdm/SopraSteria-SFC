import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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

import { FindWorkplaceAddressComponent } from './find-workplace-address.component';

describe('FindWorkplaceComponent', () => {
  async function setup() {
    const component = await render(FindWorkplaceAddressComponent, {
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
          provide: LocationService,
          useClass: MockLocationService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const locationService = injector.inject(LocationService) as LocationService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      locationService,
      spy,
    };
  }

  it('should render a FindWorkplaceAddressComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Parent journey', () => {
    it('should not lookup postcode when the form is empty', async () => {
      const { component, locationService } = await setup();
      const findAddressButton = component.getByText('Find address');
      const getAddressesByPostCode = spyOn(locationService, 'getAddressesByPostCode').and.callThrough();

      fireEvent.click(findAddressButton);
      component.fixture.detectChanges();

      expect(getAddressesByPostCode).not.toHaveBeenCalled();
    });

    it('should display an error when Find address button is clicked without a postcode', async () => {
      const { component } = await setup();

      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');
      fireEvent.click(findAddressButton);
      const errorMessage = 'Enter the workplace postcode';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should display an error when Find address button is clicked with a postcode that is longer than 8 characters', async () => {
      const { component } = await setup();

      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');

      form.controls['postcode'].setValue('M4X P0STC0DE');
      fireEvent.click(findAddressButton);
      const errorMessage = 'Enter a valid workplace postcode';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should display an error when Find address button is clicked with an invalid postcode', async () => {
      const { component } = await setup();

      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');

      form.controls['postcode'].setValue('A3CD');
      fireEvent.click(findAddressButton);
      const errorMessage = 'Enter a valid workplace postcode';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should submit the postcode when Find address button is clicked', async () => {
      const { component, locationService } = await setup();
      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');
      const getAddressesByPostCode = spyOn(locationService, 'getAddressesByPostCode').and.callThrough();

      form.controls['postcode'].setValue('LS1 1AA');
      fireEvent.click(findAddressButton);
      component.fixture.detectChanges();

      expect(form.valid).toBeTruthy();
      expect(getAddressesByPostCode).toHaveBeenCalledWith('LS1 1AA');
    });

    it('should navigate to find-workplace-address url when continue button is clicked and a workplace name is given', async () => {
      const { component, spy } = await setup();

      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');

      form.controls['postcode'].setValue('LS1 1AA');
      component.fixture.detectChanges();
      fireEvent.click(findAddressButton);

      expect(form.valid).toBeTruthy();
      expect(spy).toHaveBeenCalledWith(['add-workplace', 'select-workplace-address']);
    });

    it('should submit and go to workplace-address-not-found when no addresses are found', async () => {
      const { component, spy, locationService } = await setup();
      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');

      form.controls['postcode'].setValue('LS1 1AB');

      const errorResponse = new HttpErrorResponse({
        error: { code: 'some code', message: 'some message' },
        status: 404,
        statusText: 'Not found',
      });

      spyOn(locationService, 'getAddressesByPostCode').and.returnValue(throwError(errorResponse));

      component.fixture.detectChanges();
      fireEvent.click(findAddressButton);

      expect(spy).toHaveBeenCalledWith(['add-workplace', 'workplace-address-not-found']);
    });

    it('should show error when server fails with a 503 error', async () => {
      const { component, locationService } = await setup();
      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');

      form.controls['postcode'].setValue('LS1 1AA');

      const errorResponse = new HttpErrorResponse({
        error: { code: `some code`, message: `some message.` },
        status: 503,
        statusText: 'Server error',
      });

      spyOn(locationService, 'getAddressesByPostCode').and.returnValue(throwError(errorResponse));

      component.fixture.detectChanges();
      fireEvent.click(findAddressButton);

      expect(component.getAllByText('Database error.', { exact: false })).toBeTruthy();
    });
  });

  describe('setBackLink()', () => {
    it('should set the correct back link when in the registration flow', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'workplace-name'],
      });
    });
  });
});
