import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocationService } from '@core/services/location.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ThankYouComponent } from './thank-you.component';

describe('ThankYouComponent', () => {
  async function setup() {
    const component = await render(ThankYouComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
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
    const componentInstance = component.fixture.componentInstance;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      componentInstance,
      spy,
    };
  }

  it('should render a ThankYouComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should say thank you', async () => {
    const { component } = await setup();
    expect(component.getByText('Thank you')).toBeTruthy();
  });

  it('should go to contact us when link clicked', async () => {
    const { component } = await setup();

    const contactUs = component.getByText('Contact us', { exact: false });

    expect(contactUs.getAttribute('href')).toBe('/contact-us');
  });
});
