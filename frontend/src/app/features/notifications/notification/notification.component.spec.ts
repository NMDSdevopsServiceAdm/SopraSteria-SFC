import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { NotificationComponent } from './notification.component';
import { NotificationsModule } from '../notifications.module';

describe('Notification', () => {
  async function setup(notificationType, approvalStatus = 'APPROVED') {
    const notificationStub = {
      created: '2020-01-01',
      isViewed: false,
      type: notificationType,
      typeContent: {
        approvalStatus: approvalStatus,
        status: 'Approved',
      },
    };

    const { fixture, getByText, queryByTestId, queryByText, getByLabelText, getByTestId } = await render(
      NotificationComponent,
      {
        imports: [SharedModule, RouterModule, NotificationsModule],
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
              notifications: [notificationStub],
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
          WindowRef,
        provideHttpClient(), provideHttpClientTesting(),],
        componentProperties: {},
      },
    );

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      queryByTestId,
      getByLabelText,
      getByTestId,
      queryByText,
    };
  }

  it('should render', async () => {
    const { component } = await setup('');
    expect(component).toBeTruthy();
  });

  it('should render notification-become-a-parent component if notificationType of BECOMEAPARENT', async () => {
    const { getByTestId } = await setup('BECOMEAPARENT');
    expect(getByTestId('BECOMEAPARENT')).toBeTruthy();
  });

  it('should render notification-link-to-parent component if notificationType of LINKTOPARENTREQUEST', async () => {
    const { getByTestId } = await setup('LINKTOPARENTREQUEST');
    expect(getByTestId('LINKTOPARENT')).toBeTruthy();
  });

  it('should render notification-link-to-parent component if notificationType of LINKTOPARENTAPPROVED', async () => {
    const { getByTestId } = await setup('LINKTOPARENTAPPROVED');
    expect(getByTestId('LINKTOPARENT')).toBeTruthy();
  });

  it('should render notification-link-to-parent component if notificationType of LINKTOPARENTREJECTED', async () => {
    const { getByTestId } = await setup('LINKTOPARENTREJECTED');
    expect(getByTestId('LINKTOPARENT')).toBeTruthy();
  });

  it('should render notification-delink-to-parent component if notificationType of DELINKTOPARENT', async () => {
    const { getByTestId } = await setup('DELINKTOPARENT');
    expect(getByTestId('DELINKTOPARENT')).toBeTruthy();
  });

  it('should render notification-delink-to-parent component if notificationType of OWNERCHANGE', async () => {
    const { getByTestId } = await setup('OWNERCHANGE');
    expect(getByTestId('OWNERCHANGE')).toBeTruthy();
  });

  describe('Action Buttons', async () => {
    it('should render when approval status is REQUESTED', async () => {
      const { getByTestId } = await setup('BECOMEAPARENT', 'REQUESTED');
      expect(getByTestId('actionButtons')).toBeTruthy();
    });

    it('should render when approval status is CANCELLED', async () => {
      const { getByTestId } = await setup('BECOMEAPARENT', 'CANCELLED');
      expect(getByTestId('actionButtons')).toBeTruthy();
    });

    it('should not render when approval status is APPROVED', async () => {
      const { queryByTestId } = await setup('BECOMEAPARENT', 'APPROVED');

      const actionButtons = queryByTestId('actionButtons');

      expect(actionButtons).toBeNull();
    });

    it('should not render when approval status is REJECTED', async () => {
      const { queryByTestId } = await setup('BECOMEAPARENT', 'REJECTED');

      const actionButtons = queryByTestId('actionButtons');

      expect(actionButtons).toBeNull();
    });
  });

  describe('Subject', () => {
    it('should show the subejct line', async () => {
      const { queryByTestId } = await setup('OWNERCHANGE');
      const subjectText = queryByTestId('subject');

      expect(subjectText).toBeTruthy();
    });

    it('should show status when owner change is approved', async () => {
      const { queryByTestId } = await setup('OWNERCHANGE', 'APPROVED');

      const subjectTestId = queryByTestId('subject');
      const subjectText = 'Subject: Change data owner request: approved';

      expect(subjectTestId.textContent).toBe(subjectText);
    });

    it('should not show status when owner change is requested', async () => {
      const { queryByTestId } = await setup('OWNERCHANGE', 'REQUESTED');

      const subjectTestId = queryByTestId('subject');
      const subjectText = 'Subject: Change data owner request';

      expect(subjectTestId.textContent).toBe(subjectText);
    });

    it('should show status when become a parent request is approved', async () => {
      const { queryByTestId } = await setup('BECOMEAPARENT', null);

      const subjectTestId = queryByTestId('subject');
      const subjectText = 'Subject: Parent request: approved';

      expect(subjectTestId.textContent).toBe(subjectText);
    });
  });

  describe('showStatus', () => {
    it('should show status in subject for become a parent is approved', async () => {
      const { component, fixture, queryByTestId } = await setup('BECOMEAPARENT', null);

      const subjectTestId = queryByTestId('subject');

      fixture.detectChanges();

      expect(component.approvalStatus).toBe('approved');
      expect(component.showStatus).toBe(true);
      expect(subjectTestId.textContent).toContain('approved');
    });

    it('should show status in subject when owner change request is approved ', async () => {
      const { component, queryByTestId } = await setup('OWNERCHANGE', 'APPROVED');

      const subjectTestId = queryByTestId('subject');

      expect(component.showStatus).toBe(true);
      expect(subjectTestId.textContent).toContain('approved');
    });

    it('should not show status in subject when owner change is requested ', async () => {
      const { component, queryByTestId } = await setup('OWNERCHANGE', 'REQUESTED');

      const subjectTestId = queryByTestId('subject');

      expect(component.showStatus).toBe(false);
      expect(subjectTestId.textContent).not.toContain('approved');
    });

    it('should be false when link to parent is approved ', async () => {
      const { component } = await setup('LINKTOPARENTAPPROVED');

      expect(component.showStatus).toBe(false);
    });
  });
});