import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { RegistrationModule } from '../../../registration/registration.module';
import { SelectWorkplaceComponent } from './select-workplace.component';

describe('SelectWorkplaceComponent', () => {
  async function setup(registrationFlow = true) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId, queryByTestId } = await render(
      SelectWorkplaceComponent,
      {
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
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const registrationService = injector.inject(RegistrationService) as RegistrationService;

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
      getByTestId,
      queryByTestId,
      registrationService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace progress bar and the user progress bar', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
    expect(getByTestId('progress-bar-2')).toBeTruthy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
    const { queryByTestId } = await setup(false);

    expect(queryByTestId('progress-bar-1')).toBeFalsy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should display postcode retrieved from registration service at top and in each workplace address(2)', async () => {
    const { getAllByText } = await setup();

    const retrievedPostcode = 'ABC 123';

    expect(getAllByText(retrievedPostcode, { exact: false }).length).toBe(3);
  });

  it('should show the names and towns/cities of the companies listed', async () => {
    const { component, queryByText, getAllByText } = await setup();

    const firstLocationName = 'Workplace Name';
    const secondLocationName = 'Test Care Home';
    const townCity = 'Manchester';

    console.log(component.locationAddresses);
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
      fixture.detectChanges();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.workplace).toBe('123');
    });

    it('should not prefill the form with selected workplace if it does not exists', async () => {
      const { component } = await setup();

      component.registrationService.selectedLocationAddress$ = new BehaviorSubject(null);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeFalsy();
      expect(form.value.workplace).toBe(null);
    });
  });

  describe('Navigation', () => {
    it('should call the establishmentExistsCheck when selecting workplace', async () => {
      const { component, fixture, getByText, registrationService } = await setup();

      const registrationSpy = spyOn(registrationService, 'checkIfEstablishmentExists').and.returnValue(
        of({ exists: false }),
      );

      const locationId = component.locationAddresses[0].locationId;
      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(registrationSpy).toHaveBeenCalledWith(locationId);
    });

    it('should navigate to the cannot-create-account url when selecting the workplace, if the establishment already exists in the service', async () => {
      const { fixture, getByText, spy, registrationService } = await setup();

      spyOn(registrationService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: true }));

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration', 'cannot-create-account'], {
        state: { returnTo: 'registration/select-workplace' },
      });
    });

    it('should navigate to the type-of-employer url in registration flow when workplace selected and the establishment does not already exist in the service', async () => {
      const { getByText, fixture, spy } = await setup();

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration', 'type-of-employer']);
    });

    it('should navigate to the confirm-details page in registration flow when returnToConfirmDetails is not null and the establishment does not already exist in the service', async () => {
      const { component, getByText, fixture, spy } = await setup(false);

      component.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };
      component.setNextRoute();
      fixture.detectChanges();

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['registration/confirm-details']);
    });

    it('should navigate to the problem-with-the-service url when there is a problem with the checkIfEstablishmentExists call', async () => {
      const { fixture, getByText, spy, registrationService } = await setup();

      spyOn(registrationService, 'checkIfEstablishmentExists').and.returnValue(throwError('error'));

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/problem-with-the-service']);
    });

    it('should navigate back to the find-workplace url in registration flow when Change clicked', async () => {
      const { getByText } = await setup();

      const changeButton = getByText('Change');
      expect(changeButton.getAttribute('href')).toBe('/registration/find-workplace');
    });

    it('should navigate to workplace-name-address url in registration flow when workplace not displayed button clicked', async () => {
      const { getByText } = await setup();

      const notDisplayedButton = getByText('Workplace is not displayed or is not correct');
      expect(notDisplayedButton.getAttribute('href')).toBe('/registration/workplace-name-address');
    });
  });
});
