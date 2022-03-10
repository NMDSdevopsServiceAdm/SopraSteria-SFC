import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddWorkplaceModule } from '../add-workplace.module';
import { SelectMainServiceComponent } from './select-main-service.component';

describe('SelectMainServiceComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText, getByLabelText } = await render(SelectMainServiceComponent, {
      imports: [
        SharedModule,
        AddWorkplaceModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
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
      getByLabelText,
    };
  }

  it('should show SelectMainServiceComponent component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show CQC text when following the CQC regulated flow', async () => {
    const { component, fixture, getByText } = await setup();

    component.isRegulated = true;

    fixture.detectChanges();
    const cqcText = getByText(
      'Because you said the main service you provide is regulated by the Care Quality Commission (CQC), Skills for Care will need to check your selection matches the CQC database.',
    );
    expect(cqcText).toBeTruthy();
  });

  it('should show no description text when following the not CQC regulated flow', async () => {
    const { component, fixture, queryByText } = await setup();

    component.isRegulated = false;

    fixture.detectChanges();
    const cqcText = queryByText(
      'We need some details about where you work. You need to answer these questions before we can create your account.',
    );

    expect(cqcText).toBeNull();
  });

  it('should see "Select its main service"', async () => {
    const { component, fixture, queryByText } = await setup();

    component.isParent = true;
    component.isRegulated = false;
    fixture.detectChanges();

    expect(queryByText('Select its main service')).toBeTruthy();
  });

  it('should show add-workplace error message when nothing has been selected', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();
    component.isRegulated = true;
    const form = component.form;

    fixture.detectChanges();

    const errorMessage = 'Select the main service it provides';

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage).length).toBe(2);
  });

  it('should submit and go to the add-workplace/add-total-staff url when option selected', async () => {
    const { component, fixture, getByText, getByLabelText, spy } = await setup();

    component.isParent = true;
    component.isRegulated = true;
    fixture.detectChanges();

    const radioButton = getByLabelText('Name');
    fireEvent.click(radioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'add-total-staff']);
  });

  describe('setBackLink()', () => {
    it('should set back link to workplace-name-address when is regulated and address entered manually', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.workplaceService.isRegulated$.next(true);
      component.workplaceService.manuallyEnteredWorkplace$.next(true);

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'workplace-name-address'],
      });
    });

    it('should set back link to your-workplace when is regulated and there is one address in locationAddresses in workplace service', async () => {
      const { component } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = true;
      component.workplaceService.manuallyEnteredWorkplace$.next(false);
      component.workplaceService.locationAddresses$.next([
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
        url: ['add-workplace', 'your-workplace'],
      });
    });

    it('should set back link to select-workplace when is regulated and there is more than one address in locationAddresses in workplace service', async () => {
      const { component } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = true;
      component.workplaceService.manuallyEnteredWorkplace$.next(false);
      component.workplaceService.locationAddresses$.next([
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
        url: ['add-workplace', 'select-workplace'],
      });
    });

    it('should set back link to workplace-name-address when is not regulated and address entered manually', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = false;
      component.workplaceService.manuallyEnteredWorkplace$.next(true);

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'workplace-name-address'],
      });
    });

    it('should set back link to select-workplace-address when is not regulated, address was not entered manually and nameEnteredManually set to false', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = false;
      component.workplaceService.manuallyEnteredWorkplace$.next(false);
      component.workplaceService.manuallyEnteredWorkplaceName$.next(false);

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'select-workplace-address'],
      });
    });

    it('should set back link to workplace-name when is not regulated, address was not entered manually and nameEnteredManually set to true', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');
      component.isRegulated = false;
      component.workplaceService.manuallyEnteredWorkplace$.next(false);
      component.workplaceService.manuallyEnteredWorkplaceName$.next(true);

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'workplace-name'],
      });
    });

    it('should set back link to confirm-workplace-details when returnToConfirmDetails is not null', async () => {
      const { component } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.returnToConfirmDetails = { url: ['add-workplace', 'confirm-workplace-details'] };
      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'confirm-workplace-details'],
      });
    });
  });
});
