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

import { FindWorkplaceAddressComponent } from './find-workplace-address.component';

fdescribe('FindWorkplaceAddressComponent', () => {
  async function setup() {
    const component = await render(FindWorkplaceAddressComponent, {
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
    const locationService = injector.inject(LocationService) as LocationService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      locationService,
      spy,
    };
  }

  it('should render a NameOfWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Registration journey', () => {
    it('should display an error when Find address button is clicked without a postcode', async () => {
      const { component } = await setup();

      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');
      fireEvent.click(findAddressButton);
      const errorMessage = 'Enter your workplace postcode';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should display an error when Find address button is clicked with an invalid postcode', async () => {
      const { component } = await setup();

      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');

      form.controls['postcode'].setValue('invalid postcode');
      fireEvent.click(findAddressButton);
      const errorMessage = 'Enter a valid workplace postcode';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should submit the postcode when find address button is clicked', async () => {
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

    // Not Working
    it('should navigate to find-workplace-address url when continue button is clicked and a workplace name is given', async () => {
      const { component, spy } = await setup();
      const form = component.fixture.componentInstance.form;
      const findAddressButton = component.getByText('Find address');

      form.controls['postcode'].setValue('LS1 1AB');
      component.fixture.detectChanges();
      fireEvent.click(findAddressButton);

      expect(spy).toHaveBeenCalledWith(['registration', 'select-workplace-address']);
    });
  });

  // describe('Parent journey', () => {
  //   it('should render the correct heading when in the parent journey', async () => {
  //     const { component } = await setup('add-workplace');

  //     const parentHeading = component.queryByText(`What's the name of the workplace?`);

  //     expect(parentHeading).toBeTruthy();
  //   });

  //   it('should display an error when continue is clicked without adding a workplace name', async () => {
  //     const { component } = await setup('add-workplace');

  //     const form = component.fixture.componentInstance.form;
  //     const continueButton = component.getByText('Continue');
  //     fireEvent.click(continueButton);
  //     const errorMessage = 'Enter the name of the workplace';

  //     expect(form.invalid).toBeTruthy();
  //     expect(component.getAllByText(errorMessage).length).toBe(2);
  //   });

  //   it('should navigate to find-workplace-address url when continue button is clicked and a workplace name is given', async () => {
  //     const { component, spy } = await setup('add-workplace');
  //     const form = component.fixture.componentInstance.form;
  //     const continueButton = component.getByText('Continue');

  //     form.controls['workplaceName'].setValue('Place Name');
  //     fireEvent.click(continueButton);

  //     expect(form.valid).toBeTruthy();
  //     expect(spy).toHaveBeenCalledWith(['add-workplace', 'find-workplace-address']);
  //   });
  // });

  // describe('setBackLink()', () => {
  //   it('should set the correct back link when in the registration flow', async () => {
  //     const { component } = await setup('registration');
  //     const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

  //     component.fixture.componentInstance.setBackLink();
  //     component.fixture.detectChanges();

  //     expect(backLinkSpy).toHaveBeenCalledWith({
  //       url: ['/registration', 'new-regulated-by-cqc'],
  //     });
  //   });

  // it('should set the correct back link when in the parent flow', async () => {
  //   const { component } = await setup('add-workplace');
  //   const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

  //   component.fixture.componentInstance.setBackLink();
  //   component.fixture.detectChanges();

  //   expect(backLinkSpy).toHaveBeenCalledWith({
  //     url: ['/add-workplace', 'new-regulated-by-cqc'],
  //   });
  // });
  // });
});
