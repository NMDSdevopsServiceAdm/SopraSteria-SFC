import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { ChangeExpiresSoonAlertsComponent } from './change-expires-soon-alerts.component';

describe('ChangeExpiresSoonAlertsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(ChangeExpiresSoonAlertsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, WorkplaceModule],
      providers: [
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                expiresSoonAlertDate: {
                  expiresSoonAlertDate: '90',
                },
                establishment: {
                  uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8de',
                },
              },
            },
          }),
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const establishment = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentSpy = spyOn(establishment, 'setExpiresSoonAlertDates');
    establishmentSpy.and.callThrough();

    const alert = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alert, 'addAlert');
    alertSpy.and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      routerSpy,
      establishmentSpy,
      alertSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();
    expect(getByText(`Manage expiry alerts`)).toBeTruthy();
  });

  it('should display the different radio options', async () => {
    const { getByText } = await setup();

    expect(getByText('90 days before the training expires')).toBeTruthy();
    expect(getByText('60 days before the training expires')).toBeTruthy();
    expect(getByText('30 days before the training expires')).toBeTruthy();
  });

  it('should prefill the form with the current expires soon date from the resolver', async () => {
    const { component } = await setup();

    expect(component.form.value.expiresSoonAlerts).toBe('90');
  });

  it('should have url for the training and quals tab on Cancel button', async () => {
    const { getByText } = await setup();

    const cancelButton = getByText('Cancel');

    expect(cancelButton.getAttribute('href')).toEqual('/dashboard#training-and-qualifications');
  });

  describe('onSubmit', () => {
    it('should update the expires soon dates on submit', async () => {
      const { component, establishmentSpy, getByText } = await setup();

      const sixtyDaysRadioButton = getByText('60 days before the training expires');
      fireEvent.click(sixtyDaysRadioButton);

      const saveAndReturnButton = getByText('Save and return');
      fireEvent.click(saveAndReturnButton);

      expect(component.form.valid).toBeTruthy();
      expect(establishmentSpy).toHaveBeenCalledWith('98a83eef-e1e1-49f3-89c5-b1287a3cc8de', '60');
    });

    it('should navigate to the training and quals tab on submit', async () => {
      const { component, routerSpy, getByText } = await setup();

      const saveAndReturnButton = getByText('Save and return');
      fireEvent.click(saveAndReturnButton);

      expect(component.form.valid).toBeTruthy();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
    });

    it('should display an alert when the "Save and return" button is clicked', async () => {
      const { getByText, fixture, alertSpy } = await setup();

      const sixtyDaysRadioButton = getByText('60 days before the training expires');
      fireEvent.click(sixtyDaysRadioButton);

      const saveAndReturnButton = getByText('Save and return');
      fireEvent.click(saveAndReturnButton);

      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `'Expires soon' alerts set to 60 days`,
      });
    });
  });
});