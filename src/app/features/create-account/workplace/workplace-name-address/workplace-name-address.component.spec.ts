import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  WorkplaceNameAddressComponent,
} from '@features/create-account/workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceModule } from '@features/workplace/workplace.module';
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
        // { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
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
  });

  // it('should display postcode retrieved from registration service at top and in each workplace address(2)', async () => {
  //   const { getAllByText } = await setup();

  //   const retrievedPostcode = 'ABC 123';

  //   expect(getAllByText(retrievedPostcode, { exact: false }).length).toBe(3);
  // });

  // it('should show the names and towns/cities of the companies listed', async () => {
  //   const { queryByText, getAllByText } = await setup();

  //   const firstLocationName = 'Name';
  //   const secondLocationName = 'Test Care Home';
  //   const townCity = 'Manchester';

  //   expect(queryByText(firstLocationName, { exact: false })).toBeTruthy();
  //   expect(queryByText(secondLocationName, { exact: false })).toBeTruthy();
  //   expect(getAllByText(townCity, { exact: false }).length).toBe(2);
  // });

  // it('should display none selected error message(twice) when no radio box selected on clicking Continue', async () => {
  //   const { component, fixture, getAllByText, queryByText, getByText } = await setup();
  //   const errorMessage = `Select your workplace if it's displayed`;
  //   const form = component.form;
  //   const continueButton = getByText('Continue');

  //   expect(queryByText(errorMessage, { exact: false })).toBeNull();

  //   fireEvent.click(continueButton);
  //   fixture.detectChanges();
  //   expect(form.invalid).toBeTruthy();
  //   expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
  // });

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
