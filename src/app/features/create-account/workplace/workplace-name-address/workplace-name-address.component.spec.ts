import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RegistrationModule } from '../../../registration/registration.module';
import { WorkplaceNameAddressComponent } from './workplace-name-address.component';

describe('WorkplaceNameAddressComponent', () => {
  async function setup(flow, postcodeOrLocationId = '', searchMethod = '', useDifferentLocationIdOrPostcode = false) {
    const component = await render(WorkplaceNameAddressComponent, {
      imports: [SharedModule, RegistrationModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: RegistrationService,
          useClass: RegistrationService,
          useValue: {
            postcodeOrLocationId$: {
              value: postcodeOrLocationId,
            },
            searchMethod$: {
              value: searchMethod,
            },
            useDifferentLocationIdOrPostcode$: {
              value: useDifferentLocationIdOrPostcode,
              next: () => {
                return true;
              },
            },
          },
          deps: [HttpClient],
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
      spy,
    };
  }

  it('should create', async () => {
    const { component } = await setup('registration');
    expect(component).toBeTruthy();
  });
});
