import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  const setup = async () => {
    const { fixture, getByTestId } = await render(AlertComponent, {
      imports: [SharedModule],
      providers: [AlertService, WindowRef],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      getByTestId,
      alertSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the pending alert', async () => {
    const { component, fixture, getByTestId } = await setup();
    component.isAlertPositionInside = true;
    component.alert = { type: 'pending', message: 'alert message' };

    fixture.detectChanges();

    expect(getByTestId('pending_alert_inside')).toBeTruthy();
  });

  it('should show the success alert with provided link', async () => {
    const { component, fixture, getByTestId } = await setup();
    component.isAlertPositionInside = false;
    component.alert = { type: 'success', message: 'alert message' };
    component.linkTextForAlert = 'cancel request';

    fixture.detectChanges();

    expect(getByTestId('success_alert_with_link')).toBeTruthy();
  });

  describe('no provided link and isAlertPositionInside is false', () => {
    it('should show the generic alert for a success type', async () => {
      const { component, fixture, getByTestId } = await setup();
      component.isAlertPositionInside = false;
      component.alert = { type: 'success', message: 'alert message' };

      fixture.detectChanges();

      expect(getByTestId('generic_alert')).toBeTruthy();
    });

    it('should show the generic alert for a warning type', async () => {
      const { component, fixture, getByTestId } = await setup();
      component.isAlertPositionInside = false;
      component.alert = { type: 'warning', message: 'alert message' };

      fixture.detectChanges();

      expect(getByTestId('generic_alert')).toBeTruthy();
    });
  });
});
