import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';
import { NotificationComponent } from './notification.component';

import createSpy = jasmine.createSpy;

describe('NotificationBecomeAParentComponent', () => {
  async function setup(notificationType, approvalStatus = 'APPROVED') {
    const notificationStub = {
      created: '2020-01-01',
      isViewed: false,
      type: notificationType,
      typeContent: {
        approvalStatus: approvalStatus,
      },
    };

    const component = await render(NotificationComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [NotificationTypePipe],
      providers: [
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: NotificationsService,
          useValue: {
            getNotificationDetails() {
              return of(notificationStub);
            },
            setNotificationViewed() {
              return of({
                establishmentNotification: true,
                notification: notificationStub,
              });
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                notificationUid: '',
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    return {
      component,
    };
  }

  it('should render', async () => {
    const { component } = await setup('');
    expect(component).toBeTruthy();
  });

  it('should render notification-become-a-parent component if notificationType of BECOMEAPARENT', async () => {
    const { component } = await setup('BECOMEAPARENT');
    component.getByTestId('BECOMEAPARENT');
  });

  it('should render notification-link-to-parent component if notificationType of LINKTOPARENTREQUEST', async () => {
    const { component } = await setup('LINKTOPARENTREQUEST');
    component.getByTestId('LINKTOPARENT');
  });

  it('should render notification-link-to-parent component if notificationType of LINKTOPARENTAPPROVED', async () => {
    const { component } = await setup('LINKTOPARENTAPPROVED');
    component.getByTestId('LINKTOPARENT');
  });

  it('should render notification-link-to-parent component if notificationType of LINKTOPARENTREJECTED', async () => {
    const { component } = await setup('LINKTOPARENTREJECTED');
    component.getByTestId('LINKTOPARENT');
  });

  it('should render notification-delink-to-parent component if notificationType of DELINKTOPARENT', async () => {
    const { component } = await setup('DELINKTOPARENT');
    component.getByTestId('DELINKTOPARENT');
  });

  it('should render notification-delink-to-parent component if notificationType of OWNERCHANGE', async () => {
    const { component } = await setup('OWNERCHANGE');
    component.getByTestId('OWNERCHANGE');
  });

  describe('Action Buttons', async () => {
    it('should render when approval status is REQUESTED', async () => {
      const { component } = await setup('BECOMEAPARENT', 'REQUESTED');
      component.getByTestId('actionButtons');
    });

    it('should render when approval status is CANCELLED', async () => {
      const { component } = await setup('BECOMEAPARENT', 'CANCELLED');
      component.getByTestId('actionButtons');
    });

    it('should not render when approval status is APPROVED', async () => {
      const { component } = await setup('BECOMEAPARENT', 'APPROVED');

      const actionButtons = component.queryByTestId('actionButtons');

      expect(actionButtons).toBeNull();
    });

    it('should not render when approval status is REJECTED', async () => {
      const { component } = await setup('BECOMEAPARENT', 'REJECTED');

      const actionButtons = component.queryByTestId('actionButtons');

      expect(actionButtons).toBeNull();
    });
  });
});
