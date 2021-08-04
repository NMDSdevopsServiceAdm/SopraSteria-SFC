import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { WorkplaceNameAddressComponent } from '@features/add-workplace/workplace-name-address/workplace-name-address.component';
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
                    path: 'add-workplace',
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
    const expectedTitle = `What's the workplace name and address?`;

    expect(getByText(expectedTitle, { exact: false })).toBeTruthy();
  });

  it('should navigate to new-select-main-service page on success if feature flag is on', async () => {
    const { component, fixture, getByText, spy } = await setup();
    const form = component.form;

    form.controls['workplaceName'].setValue('Workplace');
    form.controls['address1'].setValue('1 Main Street');
    form.controls['townOrCity'].setValue('London');
    form.controls['county'].setValue('Greater London');
    form.controls['postcode'].setValue('SE1 1AA');

    component.createAccountNewDesign = true;
    fixture.detectChanges();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeFalsy();
    expect(spy).toHaveBeenCalledWith(['/add-workplace', 'new-select-main-service']);
  });

  it('should navigate to select-main-service page on success if feature flag is off', async () => {
    const { component, fixture, getByText, spy } = await setup();
    const form = component.form;

    form.controls['workplaceName'].setValue('Workplace');
    form.controls['address1'].setValue('1 Main Street');
    form.controls['townOrCity'].setValue('London');
    form.controls['county'].setValue('Greater London');
    form.controls['postcode'].setValue('SE1 1AA');

    component.createAccountNewDesign = false;
    fixture.detectChanges();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeFalsy();
    expect(spy).toHaveBeenCalledWith(['/add-workplace', 'select-main-service']);
  });

  describe('Error messages', () => {
    it(`should display an error message when workplace name isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the name of the workplace';

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
        url: ['/add-workplace', 'new-workplace-not-found'],
      });
    });

    it('should set the back link to `workplace-address-not-found` when returnToWorkplaceNotFound is false and returnToCouldNotFindWorkplaceAddress is true', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.createAccountNewDesign = true;
      component.returnToWorkplaceNotFound = false;
      component.returnToCouldNotFindWorkplaceAddress = true;
      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'workplace-address-not-found'],
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
        url: ['/add-workplace', 'select-workplace'],
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
        url: ['/add-workplace', 'select-workplace-address'],
      });
    });
  });
});
