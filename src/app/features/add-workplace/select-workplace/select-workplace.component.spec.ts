import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { SelectWorkplaceComponent } from './select-workplace.component';

describe('SelectWorkplaceComponent', () => {
  async function setup(addWorkplaceFlow = true, manyLocationAddresses = false) {
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
            provide: WorkplaceService,
            useFactory: MockWorkplaceService.factory({ value: 'Private Sector' }, manyLocationAddresses),
            deps: [HttpClient],
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                parent: {
                  url: [
                    {
                      path: addWorkplaceFlow ? 'add-workplace' : 'confirm-workplace-details',
                    },
                  ],
                },
              },
            },
          },
          FormBuilder,
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workplaceService = injector.inject(WorkplaceService) as WorkplaceService;

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
      workplaceService,
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

  it('should render the workplace progress bar but not the user progress bar', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should not render the progress bar when accessed from outside the flow', async () => {
    const { queryByTestId } = await setup(false);

    expect(queryByTestId('progress-bar-1')).toBeFalsy();
  });

  it('should render the radio button form if there are less than 5 location addresses for a given postcode', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('radio-button-form')).toBeTruthy();
    expect(queryByTestId('dropdown-form')).toBeFalsy();
  });

  it('should render the dropdown form if there are 5 or more location addresses for a given postcode', async () => {
    const { getByTestId, queryByTestId } = await setup(true, true);

    expect(getByTestId('dropdown-form')).toBeTruthy();
    expect(queryByTestId('radio-button-form')).toBeFalsy();
  });

  it('should show the continue button', async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should show the Save and return button and an exit link when inside the flow', async () => {
    const { component, fixture, getByText } = await setup();

    component.insideFlow = false;
    component.flow = 'add-workplace/confirm-workplace-details';
    fixture.detectChanges();

    const cancelLink = getByText('Cancel');

    expect(getByText('Save and return')).toBeTruthy();
    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual('/add-workplace/confirm-workplace-details');
  });

  it('should show the names and towns/cities of the companies listed if radio button form showing', async () => {
    const { queryByText, getAllByText } = await setup();

    const firstLocationName = 'Name';
    const secondLocationName = 'Test Care Home';
    const townCity = 'Manchester';

    expect(queryByText(firstLocationName, { exact: false })).toBeTruthy();
    expect(queryByText(secondLocationName, { exact: false })).toBeTruthy();
    expect(getAllByText(townCity, { exact: false }).length).toBe(2);
  });

  it('should display none selected error message(twice) when no radio box selected on clicking Continue', async () => {
    const { component, getAllByText, queryByText, getByText } = await setup();

    component.workplaceService.selectedLocationAddress$ = new BehaviorSubject(null);
    component.ngOnInit();

    const errorMessage = `Select the workplace if it's displayed`;
    expect(queryByText(errorMessage, { exact: false })).toBeNull();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    const form = component.form;
    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
  });

  describe('prefillForm()', () => {
    it('should prefill the form with selected workplace if it exists', async () => {
      const { component, fixture } = await setup();

      component.workplaceService.selectedLocationAddress$.value.locationId = '123';
      fixture.detectChanges();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.workplace).toBe('123');
    });

    it('should not prefill the form with selected workplace if it does not exists', async () => {
      const { component } = await setup();

      component.workplaceService.selectedLocationAddress$ = new BehaviorSubject(null);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeFalsy();
      expect(form.value.workplace).toBe(null);
    });
  });

  describe('Navigation', () => {
    it('should call the establishmentExistsCheck when selecting workplace', async () => {
      const { component, fixture, getByText, workplaceService } = await setup();

      const workplaceSpy = spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: false }));

      const locationId = component.locationAddresses[0].locationId;
      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(workplaceSpy).toHaveBeenCalledWith(locationId);
    });

    it('should navigate to the cannot-create-account url when selecting the workplace, if the establishment already exists in the service', async () => {
      const { fixture, getByText, spy, workplaceService } = await setup();

      spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: true }));

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['add-workplace', 'cannot-create-account'], {
        state: { returnTo: 'add-workplace/select-workplace' },
      });
    });

    it('should navigate to the type-of-employer url in add-workplace flow when workplace selected and the establishment does not already exists in the service', async () => {
      const { getByText, fixture, spy } = await setup();

      const firstWorkplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(firstWorkplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['add-workplace', 'type-of-employer']);
    });

    it('should navigate to the confirm-workplace-details page when returnToConfirmDetails is not null and the establishment does not already exist in the service', async () => {
      const { component, getByText, fixture, spy } = await setup(false);

      component.returnToConfirmDetails = { url: ['add-workplace', 'confirm-workplace-details'] };
      component.setNextRoute();
      fixture.detectChanges();

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Save and return');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['add-workplace/confirm-workplace-details']);
    });

    it('should navigate to the problem-with-the-service url when there is a problem with the checkIfEstablishmentExists call', async () => {
      const { fixture, getByText, spy, workplaceService } = await setup();

      spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(throwError('error'));

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/problem-with-the-service']);
    });

    it('should navigate back to the find-workplace url in add-workplace flow when Change clicked', async () => {
      const { getByText } = await setup();

      const changeButton = getByText('Change');

      expect(changeButton.getAttribute('href')).toBe('/add-workplace/find-workplace');
    });

    it('should navigate to workplace-name-address url in add-workplace flow when workplace not displayed button clicked', async () => {
      const { getByText } = await setup();

      const notDisplayedButton = getByText('Workplace is not displayed or is not correct');

      expect(notDisplayedButton.getAttribute('href')).toBe('/add-workplace/workplace-name-address');
    });
  });
});
