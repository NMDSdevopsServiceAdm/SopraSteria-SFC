import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, getByText, render } from '@testing-library/angular';

import { NewSelectMainServiceComponent } from './new-select-main-service.component';

describe('NewSelectMainServiceComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText, getByLabelText, getByTestId } = await render(
      NewSelectMainServiceComponent,
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
            provide: WorkplaceService,
            useClass: MockWorkplaceService,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
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
          FormBuilder,
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
      registrationService,
      getAllByText,
      queryByText,
      getByText,
      getByLabelText,
      getByTestId,
    };
  }

  it('should show NewSelectMainServiceComponent component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show CQC text when following the CQC regulated flow', async () => {
    const { component, fixture, getByText } = await setup();

    component.isRegulated = true;
    component.renderForm = true;

    fixture.detectChanges();
    const cqcText = getByText(
      'Because you said the main service you provide is regulated by the Care Quality Commission (CQC), Skills for Care will need to check your selection matches the CQC database.',
    );
    expect(cqcText).toBeTruthy();
  });

  it('should show standard text when following the not CQC regulated flow and feature flag is off', async () => {
    const { component, fixture, getByText } = await setup();

    component.createAccountNewDesign = false;
    component.isRegulated = false;
    component.renderForm = true;

    fixture.detectChanges();
    const cqcText = getByText(
      'We need some details about where you work. You need to answer these questions before we can create your account.',
    );

    expect(cqcText).toBeTruthy();
  });

  it('should show no description text when following the not CQC regulated flow and feature flag is on', async () => {
    const { component, fixture, queryByText } = await setup();

    component.createAccountNewDesign = true;
    component.isRegulated = false;
    component.renderForm = true;

    fixture.detectChanges();
    const cqcText = queryByText(
      'We need some details about where you work. You need to answer these questions before we can create your account.',
    );

    expect(cqcText).toBeNull();
  });

  it("should see 'Select your main service' when is not a parent", async () => {
    const { component, fixture, queryByText } = await setup();

    component.isParent = false;
    component.isRegulated = false;
    component.renderForm = true;
    fixture.detectChanges();

    expect(queryByText('Select your main service')).toBeTruthy();
  });

  it('should error when nothing has been selected', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();
    component.isRegulated = true;
    component.renderForm = true;
    const form = component.form;

    fixture.detectChanges();

    const errorMessage = 'Select your main service';

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage).length).toBe(3);
  });

  it('should submit and go to the registration/add-user-details url when option selected and is not parent', async () => {
    const { component, fixture, getByText, getByLabelText, spy } = await setup();

    component.isParent = false;
    component.isRegulated = true;
    component.renderForm = true;
    fixture.detectChanges();

    const radioButton = getByLabelText('Name');
    fireEvent.click(radioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'add-user-details']);
  });

  it('should submit and go to the registration/confirm-details url when option selected and returnToConfirmDetails is not null', async () => {
    const { component, fixture, getByText, getByLabelText, spy } = await setup();

    component.isParent = false;
    component.isRegulated = true;
    component.renderForm = true;
    component.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };
    fixture.detectChanges();

    const radioButton = getByLabelText('Name');
    fireEvent.click(radioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'confirm-details']);
  });

  it('should show the other input box when an other option is selected', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.isParent = false;
    component.isRegulated = true;
    component.renderForm = true;
    fixture.detectChanges();
    const otherDrop = getByTestId('workplaceServiceOther-123');

    expect(otherDrop.getAttribute('class')).toContain('govuk-radios__conditional--hidden');

    const otherOption = getByTestId('workplaceService-123');
    fireEvent.click(otherOption);

    expect(otherDrop.getAttribute('class')).not.toContain('govuk-radios__conditional--hidden');
  });

  fit('should prefill the other input box with the correct value', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.isParent = false;
    component.isRegulated = true;
    component.renderForm = true;
    fixture.detectChanges();
    const form = component.form;
    const otherOption = getByTestId('workplaceService-123');
    fireEvent.click(otherOption);

    form.get('otherWorkplaceService123').setValue('A main service you have never heard of');

    component.ngOnInit();

    fixture.detectChanges();

    expect(form.get('otherWorkplaceService123').value).toEqual('A main service you have never heard of');
  });

  describe('setBackLink()', () => {
    it('should set back link to workplace-name-address when is regulated and address entered manually', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.registrationService.isRegulated$.next(true);
      component.registrationService.manuallyEnteredWorkplace$.next(true);

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'workplace-name-address'],
      });
    });

    it('should set back link to your-workplace when is regulated and there is one address in locationAddresses in registration service', async () => {
      const { component } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = true;
      component.registrationService.manuallyEnteredWorkplace$.next(false);
      component.registrationService.locationAddresses$.next([
        {
          postalCode: 'ABC 123',
          addressLine1: '1 Street',
          county: 'Greater Manchester',
          locationName: 'Name',
          townCity: 'Manchester',
          locationId: '123',
        },
      ]);

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'your-workplace'],
      });
    });

    it('should set back link to select-workplace when is regulated and there is more than one address in locationAddresses in registration service', async () => {
      const { component } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = true;
      component.registrationService.manuallyEnteredWorkplace$.next(false);
      component.registrationService.locationAddresses$.next([
        {
          postalCode: 'ABC 123',
          addressLine1: '1 Street',
          county: 'Greater Manchester',
          locationName: 'Name',
          townCity: 'Manchester',
          locationId: '123',
        },
        {
          postalCode: 'ABC 123',
          addressLine1: '2 Street',
          county: 'Greater Manchester',
          locationName: 'Test Care Home',
          townCity: 'Manchester',
          locationId: '12345',
        },
      ]);

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'select-workplace'],
      });
    });

    it('should set back link to workplace-name-address when is not regulated and address entered manually', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = false;
      component.registrationService.manuallyEnteredWorkplace$.next(true);

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'workplace-name-address'],
      });
    });

    it('should set back link to select-workplace-address when is not regulated, address was not entered manually and nameEnteredManually set to false', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = false;
      component.registrationService.manuallyEnteredWorkplace$.next(false);
      component.registrationService.manuallyEnteredWorkplaceName$.next(false);

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'select-workplace-address'],
      });
    });

    it('should set back link to workplace-name when is not regulated, address was not entered manually and nameEnteredManually set to true', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = false;
      component.registrationService.manuallyEnteredWorkplace$.next(false);
      component.registrationService.manuallyEnteredWorkplaceName$.next(true);

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'workplace-name'],
      });
    });

    it('should set back link to confirm-details when returnToConfirmDetails is not null and feature flag is on', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.createAccountNewDesign = true;
      component.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'confirm-details'],
      });
    });
  });
});
