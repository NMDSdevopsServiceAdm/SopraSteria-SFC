import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { NotificationOwnerChangeComponent } from './notification-owner-change.component';

import createSpy = jasmine.createSpy;
describe('NotificationBecomeAParentComponent', () => {
  async function setup(approved = true) {
    const component = await render(NotificationOwnerChangeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [NotificationTypePipe],
      providers: [
        {
          provide: NotificationsService,
          useFactory: MockNotificationsService.factory(approved),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BreadcrumbService,
          useValue: {
            show: createSpy(),
          },
        },
      ],
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
