import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import {
  WorkplaceNameAddressComponent,
} from '@features/create-account/workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceModule } from '@features/workplace/workplace.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

describe('WorkplaceNameAddressComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(WorkplaceNameAddressComponent, {
      imports: [
        SharedModule,
        WorkplaceModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        WorkplaceService,
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
        FormBuilder,
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

  it('should display the correct title', async () => {
    const { getByText } = await setup();
    const expectedTitle = `What's your workplace name and address?`;

    expect(getByText(expectedTitle, { exact: false })).toBeTruthy();
  });

  describe('Error messages', () => {
    it(`should display an error message when workplace name isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the name of your workplace';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when building and street isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the building (number or name) and street';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when town or city isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the town or city';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when county isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the county';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when postcode isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the postcode';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it('should display an error message when an invalid postcode is entered', async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter a valid workplace postcode';

      form.controls['postcode'].setValue('M1');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when workplace name exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Workplace name must be 120 characters or fewer';

      form.controls['workplaceName'].setValue(
        'Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Long Workplace Name',
      );
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when address 1 exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Building and street must be 40 characters or fewer';

      form.controls['address1'].setValue('Long Workplace Building Name Or Number And Street');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when town or city exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Town or city must be 40 characters or fewer';

      form.controls['townOrCity'].setValue('Very Very Very Very Long Town Or City Name');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when county exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'County must be 40 characters or fewer';

      form.controls['county'].setValue('Very Very Very Very Very Long County Name');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it(`should display an error message when postcode exceeds max characters`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Postcode must be 8 characters or fewer';

      form.controls['postcode'].setValue('AB12 34CD');
      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });
  });

  describe('setBackLink', () => {
    it('should set the back link to `workplace-not-found` when returnToWorkplaceNotFound is set to true', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.createAccountNewDesign = true;
      component.returnToWorkplaceNotFound = true;
      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'new-workplace-not-found'],
      });
    });

    it('should set the back link to `select-workplace` when returnToWorkplaceNotFound is false and isCqcRegulated is true', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.createAccountNewDesign = true;
      component.returnToWorkplaceNotFound = false;
      component.isCqcRegulated = true;
      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'select-workplace'],
      });
    });

    it('should set the back link to `select-workplace-address` when returnToWorkplaceNotFound and isCqcRegulated are false', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.createAccountNewDesign = true;
      component.returnToWorkplaceNotFound = false;
      component.isCqcRegulated = false;
      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'select-workplace-address'],
      });
    });
  });

  // describe('Navigation', () => {
  //   it('should navigate to the select-main-service url in add-workplace flow when workplace selected', async () => {
  //     const { getByText, fixture, spy } = await setup();
  //     const firstWorkplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="123"]`);
  //     fireEvent.click(firstWorkplaceRadioButton);

  //     const continueButton = getByText('Continue');
  //     fireEvent.click(continueButton);

  //     expect(spy).toHaveBeenCalledWith(['/add-workplace', 'select-main-service']);
  //   });

  //   it('should navigate back to the find-workplace url in add-workplace flow when Change clicked', async () => {
  //     const { component, fixture, getByText } = await setup();
  //     component.createAccountNewDesign = true;
  //     fixture.detectChanges();

  //     const changeButton = getByText('Change');

  //     expect(changeButton.getAttribute('href')).toBe('/add-workplace/find-workplace');
  //   });

  //   it('should navigate to workplace-name-address url in add-workplace flow when workplace not displayed button clicked', async () => {
  //     const { component, fixture, spy, getByText } = await setup();
  //     component.createAccountNewDesign = true;
  //     fixture.detectChanges();

  //     const notDisplayedButton = getByText('Workplace is not displayed or is not correct');

  //     expect(notDisplayedButton.getAttribute('href')).toBe('/add-workplace/workplace-name-address');
  //   });
  // });
});
