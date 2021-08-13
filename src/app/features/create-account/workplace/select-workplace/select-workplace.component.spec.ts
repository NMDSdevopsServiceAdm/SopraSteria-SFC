import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { RegistrationModule } from '../../../registration/registration.module';
import { SelectWorkplaceComponent } from './select-workplace.component';

describe('SelectWorkplaceComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(SelectWorkplaceComponent, {
      imports: [
        SharedModule,
        RegistrationModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
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

  it('should display postcode retrieved from registration service at top and in each workplace address(2)', async () => {
    const { getAllByText } = await setup();

    const retrievedPostcode = 'ABC 123';

    expect(getAllByText(retrievedPostcode, { exact: false }).length).toBe(3);
  });

  it('should show the names and towns/cities of the companies listed', async () => {
    const { queryByText, getAllByText } = await setup();

    const firstLocationName = 'Name';
    const secondLocationName = 'Test Care Home';
    const townCity = 'Manchester';

    expect(queryByText(firstLocationName, { exact: false })).toBeTruthy();
    expect(queryByText(secondLocationName, { exact: false })).toBeTruthy();
    expect(getAllByText(townCity, { exact: false }).length).toBe(2);
  });

  it('should display none selected error message(twice) when no radio box selected on clicking Continue', async () => {
    const { component, fixture, getAllByText, queryByText, getByText } = await setup();

    component.registrationService.selectedLocationAddress$ = new BehaviorSubject(null);
    component.ngOnInit();

    const errorMessage = `Select your workplace if it's displayed`;
    const form = component.form;
    const continueButton = getByText('Continue');

    expect(queryByText(errorMessage, { exact: false })).toBeNull();

    fireEvent.click(continueButton);
    fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
  });

  describe('prefillForm()', () => {
    it('should prefill the form with selected workplace if it exists', async () => {
      const { component, fixture } = await setup();

      component.registrationService.selectedLocationAddress$.value.locationId = '123';
      component.createAccountNewDesign = true;
      fixture.detectChanges();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.workplace).toBe('123');
    });

    it('should not prefill the form with selected workplace if it does not exists', async () => {
      const { component } = await setup();

      component.registrationService.selectedLocationAddress$ = new BehaviorSubject(null);
      component.createAccountNewDesign = true;
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeFalsy();
      expect(form.value.workplace).toBe(null);
    });
  });

  describe('Navigation', () => {
    it('should navigate to the new-select-main-service url in registration flow when workplace selected and feature flag is on', async () => {
      const { component, getByText, fixture, spy } = await setup();

      component.createAccountNewDesign = true;
      fixture.detectChanges();

      const yesRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/registration', 'new-select-main-service']);
    });

    it('should navigate to the confirm-details page in registration flow when returnToConfirmDetails is not null', async () => {
      const { component, getByText, fixture, spy } = await setup();

      component.createAccountNewDesign = true;
      component.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };
      component.setNextRoute();
      fixture.detectChanges();

      const yesRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/registration', 'confirm-details']);
    });

    it('should navigate back to the find-workplace url in registration flow when Change clicked', async () => {
      const { component, fixture, getByText } = await setup();
      component.createAccountNewDesign = true;
      fixture.detectChanges();

      const changeButton = getByText('Change');
      expect(changeButton.getAttribute('href')).toBe('/registration/find-workplace');
    });

    it('should navigate to workplace-name-address url in registration flow when workplace not displayed button clicked', async () => {
      const { component, fixture, getByText } = await setup();
      component.createAccountNewDesign = true;
      fixture.detectChanges();

      const notDisplayedButton = getByText('Workplace is not displayed or is not correct');
      expect(notDisplayedButton.getAttribute('href')).toBe('/registration/workplace-name-address');
    });
  });
});
