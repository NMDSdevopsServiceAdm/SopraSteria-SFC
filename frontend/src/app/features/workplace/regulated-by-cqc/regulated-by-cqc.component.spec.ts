import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RegulatedByCqcComponent } from './regulated-by-cqc.component';
import userEvent from '@testing-library/user-event';
import { getTestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

describe('RegulatedByCqcComponent', () => {
  const workplaceUid = 'abc131355543435';

  async function setup() {
    const setupTools = await render(RegulatedByCqcComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useValue: {
            establishment: { uid: workplaceUid },
          },
        },
        LocationService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const route = injector.inject(ActivatedRoute);

    const locationService = injector.inject(LocationService);

    return {
      ...setupTools,
      route,
      component,
      routerSpy,
      locationService,
    };
  }

  it('should render a RegulatedByCqcComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('navigation', () => {
    const mockLocationSearchResult = {
      success: 1,
      message: 'Location Found',
      locationdata: [
        {
          locationId: '1-234567890',
          locationName: 'Some workplace name',
          addressLine1: 'somewhere',
          addressLine2: '',
          townCity: 'Town name',
          county: null,
          postalCode: 'AB1 2CD',
          mainService: 'Homecare agencies',
        },
      ],
      searchmethod: 'postcode',
    };

    const errorResponse = new HttpErrorResponse({
      error: { success: 0, message: 'No location found', searchmethod: 'postcode' },
      status: 404,
      statusText: 'Not found',
    });

    it('should navigate to select-workplace if location data was found', async () => {
      const { fixture, getByLabelText, getByRole, routerSpy, route, locationService } = await setup();

      spyOn(locationService, 'getUnassignedLocationByPostCode').and.returnValue(of(mockLocationSearchResult));

      userEvent.type(getByLabelText('Enter your postcode'), 'AB1 2CD');
      userEvent.click(getByRole('button', { name: 'Continue' }));

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledWith(['../select-workplace'], { relativeTo: route });
    });

    it('should navigate to workplace-not-found if failed to find a workplace', async () => {
      const { fixture, getByLabelText, getByRole, routerSpy, route, locationService } = await setup();

      spyOn(locationService, 'getUnassignedLocationByPostCode').and.returnValue(throwError(errorResponse));

      userEvent.type(getByLabelText('Enter your postcode'), 'AB1 2CD');
      userEvent.click(getByRole('button', { name: 'Continue' }));

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledWith(['../workplace-not-found'], { relativeTo: route });
    });
  });
});
