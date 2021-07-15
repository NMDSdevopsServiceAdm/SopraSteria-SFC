import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { SelectWorkplaceAddressDirective } from '@shared/directives/create-workplace/select-workplace-address.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationModule } from '../../../registration/registration.module';
import { SelectWorkplaceAddressComponent } from './select-workplace-address.component';

describe('SelectWorkplaceAddressComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(SelectWorkplaceAddressComponent, {
      imports: [
        SharedModule,
        RegistrationModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        SelectWorkplaceAddressDirective,
        {
          provide: RegistrationService,
          useClass: MockRegistrationService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
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

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display postcode retrieved from registration service at top and in each workplace address in dropdown(2)', async () => {
    const { getAllByText } = await setup();

    const retrievedPostcode = 'ABC 123';

    expect(getAllByText(retrievedPostcode, { exact: false }).length).toBe(3);
  });

  it('should display number of addresses found which match postcode(2)', async () => {
    const { getByText } = await setup();

    const noOfAddressesMessage = '2 addresses found';

    expect(getByText(noOfAddressesMessage, { exact: false })).toBeTruthy();
  });

  describe('Error messages', () => {
    it('should display none selected error message(twice) when no address selected in dropdown on clicking Continue', async () => {
      const { component, fixture, getAllByText, queryByText, getByText } = await setup();
      const errorMessage = `Select your workplace address if it's listed`;
      const form = component.form;
      const continueButton = getByText('Continue');

      expect(queryByText(errorMessage, { exact: false })).toBeNull();

      fireEvent.click(continueButton);
      fixture.detectChanges();
      expect(form.invalid).toBeTruthy();
      expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to the find-workplace-address url in registration flow when Change clicked', async () => {
      const { component, fixture, getByText } = await setup();
      component.createAccountNewDesign = true;
      fixture.detectChanges();

      const changeButton = getByText('Change');

      expect(changeButton.getAttribute('href')).toBe('/registration/find-workplace-address');
    });

    it('should navigate to workplace-address url in registration flow when workplace not listed button clicked', async () => {
      const { component, fixture, getByText } = await setup();
      component.createAccountNewDesign = true;
      component.ngOnInit();
      fixture.detectChanges();

      const notDisplayedButton = getByText('Workplace address is not listed or is not correct');

      expect(notDisplayedButton.getAttribute('href')).toBe('/registration/workplace-address');
    });

    it('should navigate to select-main-service url in registration flow when workplace selected and Continue clicked', async () => {
      const { component, spy, getByText, fixture } = await setup();
      const form = component.form;
      const continueButton = getByText('Continue');

      form.controls['address'].setValue('1');
      form.controls['address'].markAsDirty();
      fixture.detectChanges();
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();

      expect(spy).toHaveBeenCalledWith(['/registration/select-main-service']);
    });
  });
});
