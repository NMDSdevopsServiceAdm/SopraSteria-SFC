import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { NotificationBecomeAParentComponent } from '@features/notifications/notification-become-a-parent/notification-become-a-parent.component';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import createSpy = jasmine.createSpy;
describe('NotificationBecomeAParentComponent', () => {
  async function setup(approved = true) {
    const component = await render(NotificationBecomeAParentComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      declarations: [NotificationTypePipe],
    });

    return {
      component,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
