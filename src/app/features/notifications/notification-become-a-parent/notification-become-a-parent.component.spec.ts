import { render } from '@testing-library/angular';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { getTestBed } from '@angular/core/testing';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { MockParentRequestsService } from '@core/test-utils/MockParentRequestsService';
import { NotificationBecomeAParentComponent } from '@features/notifications/notification-become-a-parent/notification-become-a-parent.component';

describe('NotificationBecomeAParentComponent', () => {
  async function setup() {
    const component =  await render(NotificationBecomeAParentComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        HomeTabComponent
      ],
      providers: [
        {
          provide: ParentRequestsService,
          useFactory: MockParentRequestsService.factory(true),
          deps: [HttpClient]
        },
      ]
    });

    const injector = getTestBed();

    return {
      component
    };
  }

  it('should render a BecomeAParent Notification', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});

