import { render } from '@testing-library/angular';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { MockParentRequestsService } from '@core/test-utils/MockParentRequestsService';
import { NotificationBecomeAParentComponent } from '@features/notifications/notification-become-a-parent/notification-become-a-parent.component';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { getTestBed } from '@angular/core/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import createSpy = jasmine.createSpy;
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

describe('NotificationBecomeAParentComponent', () => {
  async function setup(approved = true) {
    const component =  await render(NotificationBecomeAParentComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        NotificationTypePipe,
      ],
      providers: [
        {
          provide: ParentRequestsService,
          useFactory: MockParentRequestsService.factory(approved),
          deps: [HttpClient]
        },
        {
          provide: NotificationsService,
          useFactory: MockNotificationsService.factory(approved),
          deps: [HttpClient]
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService
        },
        {
          provide: BreadcrumbService,
          useValue: {
            show: createSpy()
          }
        }
      ]
    });

    return {
      component
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct message when the request is approved', async () => {
    const { component } = await setup(true);

    const message = component.getByTestId('message');
    const type = component.getByTestId('type');

    expect(message.innerText).toBe('Your request to become a parent has been accepted.');
    expect(type.innerText).toBe('Become a parent organisation');
  });

  it('should display the correct message when the request is rejected', async () => {
    const { component } = await setup(false);

    const message = component.getByTestId('message');
    const type = component.getByTestId('type');

    expect(message.innerText).toBe('Your request to become a parent has been rejected.');
    expect(type.innerText).toBe('Become a parent organisation');
  });
});

