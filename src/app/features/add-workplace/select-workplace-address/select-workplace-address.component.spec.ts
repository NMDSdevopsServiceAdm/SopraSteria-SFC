import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SelectWorkplaceAddressDirective } from '@shared/directives/create-workplace/select-workplace-address/select-workplace-address.directive';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { SelectWorkplaceAddressComponent } from './select-workplace-address.component';

describe('SelectWorkplaceAddressComponent', () => {
  async function setup(addWorkplaceFlow = true, manyLocationAddresses = false) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId, queryByTestId } = await render(
      SelectWorkplaceAddressComponent,
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
          SelectWorkplaceAddressDirective,
          {
            provide: WorkplaceService,
            useFactory: MockWorkplaceService.factory({ value: 'Private sector' }, manyLocationAddresses),
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
        ],
      },
    );

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
      getByTestId,
      queryByTestId,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct title', async () => {
    const { getAllByText } = await setup();

    const title = 'Select the workplace address';

    expect(getAllByText(title)).toBeTruthy();
  });

  it('should display postcode retrieved from workplace service at top and in each workplace address in dropdown(2)', async () => {
    const { getAllByText } = await setup();

    const retrievedPostcode = 'ABC 123';

    expect(getAllByText(retrievedPostcode, { exact: false }).length).toBe(3);
  });

  it('should render the workplace progress bar and the user progress bar', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
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

  it('should display number of addresses found which match postcode when drop down shown', async () => {
    const { getByText } = await setup(true, true);

    const noOfAddressesMessage = '5 addresses found';

    expect(getByText(noOfAddressesMessage, { exact: false })).toBeTruthy();
  });

  describe('prefillForm()', () => {
    it('should prefill the form with selected workplace if it exists', async () => {
      const { component, fixture } = await setup();

      component.workplaceService.selectedLocationAddress$.value.locationId = '123';
      const index = component.locationAddresses.findIndex((address) => (address.locationId = '123')).toString();
      fixture.detectChanges();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.workplace).toBe(index);
    });

    it('should not prefill the form with selected workplace if it does not exists', async () => {
      const { component } = await setup();

      component.workplaceService.selectedLocationAddress$ = new BehaviorSubject(null);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeFalsy();
      expect(form.value.workplace).toBe('');
    });
  });

  describe('Error messages', () => {
    it('should display none selected error message(twice) when no address selected in dropdown on clicking Continue', async () => {
      const { component, fixture, getAllByText, queryByText, getByText } = await setup();

      component.workplaceService.selectedLocationAddress$ = new BehaviorSubject(null);
      component.ngOnInit();
      fixture.detectChanges();

      const errorMessage = `Select the workplace address if it's listed`;
      expect(queryByText(errorMessage, { exact: false })).toBeNull();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      const form = component.form;
      expect(form.invalid).toBeTruthy();
      expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to the find-workplace-address url in add-workplace flow when Change clicked', async () => {
      const { getByText } = await setup();

      const changeButton = getByText('Change');

      expect(changeButton.getAttribute('href')).toBe('/add-workplace/find-workplace-address');
    });

    it('should navigate to workplace-name-address url in add-workplace flow when workplace not listed button clicked', async () => {
      const { getByText } = await setup();

      const notDisplayedButton = getByText('Enter workplace details manually');

      expect(notDisplayedButton.getAttribute('href')).toBe('/add-workplace/workplace-name-address');
    });

    it('should navigate to type-of-employer url in add-workplace flow when workplace with name selected and Continue clicked', async () => {
      const { component, spy, getByText, fixture } = await setup();
      const form = component.form;
      const continueButton = getByText('Continue');
      component.locationAddresses[1].locationName = 'Name';

      form.controls['workplace'].setValue('1');
      form.controls['workplace'].markAsDirty();
      fixture.detectChanges();
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();
      expect(component.workplaceService.selectedLocationAddress$.value).toEqual(component.locationAddresses[1]);
      expect(spy).toHaveBeenCalledWith(['add-workplace/type-of-employer']);
    });

    it('should navigate to the confirm-workplace-details page in add-workplace flow when workplace selected, Continue clicked and returnToConfirmDetails is not null', async () => {
      const { component, spy, getByText } = await setup();

      component.returnToConfirmDetails = { url: ['add-workplace', 'confirm-workplace-details'] };

      const form = component.form;
      form.controls['workplace'].setValue('1');
      form.controls['workplace'].markAsDirty();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();
      expect(spy).toHaveBeenCalledWith(['add-workplace/confirm-workplace-details']);
    });

    it('should navigate to workplace-name url in add-workplace flow when workplace without name selected and Continue clicked', async () => {
      const { component, spy, getByText, fixture } = await setup();
      const form = component.form;
      const continueButton = getByText('Continue');
      component.locationAddresses[1].locationName = null;

      form.controls['workplace'].setValue('1');
      form.controls['workplace'].markAsDirty();
      fixture.detectChanges();
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();
      expect(component.workplaceService.selectedLocationAddress$.value).toEqual(component.locationAddresses[1]);
      expect(spy).toHaveBeenCalledWith(['add-workplace/workplace-name']);
    });
  });
});
