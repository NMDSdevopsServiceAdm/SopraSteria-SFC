import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Observable } from 'rxjs';

import { NotificationLinkToParentComponent } from './notification-link-to-parent.component';

describe('NotificationLinkToParentComponent', () => {
  async function setup(approvalStatus = 'APPROVED', rejectionReason = null, permissionRequest = 'Workplace and Staff') {
    const notificationData = {
      notificationUid: 'SOME UID',
      typeContent: {
        approvalStatus: approvalStatus,
        parentEstablishmentId: 137,
        parentEstablishmentName: 'Test Parent',
        permissionRequest: permissionRequest,
        parentPostCode: 'postalcode',
        subPostCode: 'ABC123',
        rejectionReason: rejectionReason,
        requestorName: 'Test sub',
        subEstablishmentId: 312,
        subEstablishmentName: 'Test sub',
        subEstablishmentUid: 'subUid',
        requestedOwnerType: 'Workplace',
        updated: new Date('2023-12-14 17:23'),
      },
    };
    const { fixture, getByText, getByTestId, queryByText, getAllByText, findByText } = await render(
      NotificationLinkToParentComponent,
      {
        imports: [SharedModule, RouterModule],
        declarations: [NotificationTypePipe],
        providers: [
          AlertService,
          WindowRef,
          DialogService,
          {
            provide: BreadcrumbService,
            useClass: MockBreadcrumbService,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
        componentProperties: {
          events: new Observable<string>(),
          notification: notificationData,
        },
      },
    );

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      getAllByText,
      findByText,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the sub heading', async () => {
    const { getByText } = await setup();

    const subHeading = getByText('Data permissions');

    expect(subHeading).toBeTruthy();
  });

  it('should show the table headers', async () => {
    const { getByText, getByTestId } = await setup();

    const workplaceTableHeading = getByText('Workplace');
    const permissionsTableHeading = getByText('Permissions');
    const tableHeadings = getByTestId('tableHeaders');

    expect(tableHeadings).toBeTruthy();
    expect(workplaceTableHeading).toBeTruthy();
    expect(permissionsTableHeading).toBeTruthy();
  });

  describe('link to parent is requested', () => {
    it('should show the sub name and postcode', async () => {
      const { component, getByText } = await setup('REQUESTED');

      const subName = component.notification.typeContent.subEstablishmentName;
      const subPostCode = component.notification.typeContent.subPostCode;

      const linkToParentRequestText = getByText(`${subName}, ${subPostCode} want to link to you.`);

      expect(linkToParentRequestText).toBeTruthy();
    });
  });

  describe('link to parent request is cancelled', () => {
    it('should show the cancelled message', async () => {
      const { component, getByText } = await setup('CANCELLED');

      const subName = component.notification.typeContent.subEstablishmentName;

      const linkToParentRequestText = getByText(`You have a request from ${subName} to link to you.`);

      expect(linkToParentRequestText).toBeTruthy();
    });
  });

  describe('link to parent request is denied', () => {
    describe('parent notifications', () => {
      it('shows the rejected text and reason', async () => {
        const { component, getByText, fixture } = await setup('DENIED');

        component.isWorkPlaceRequester = true;
        component.notification.typeContent.rejectionReason = 'Not one of our subsidiaries';
        fixture.detectChanges();

        const subName = component.notification.typeContent.subEstablishmentName;

        const rejectedText = getByText(`You have rejected a request from ${subName} to link to you.`);
        const rejectedReasonText = getByText(component.notification.typeContent.rejectionReason);

        expect(rejectedText).toBeTruthy();
        expect(rejectedReasonText).toBeTruthy();
      });

      it('shows the rejected text and no reason', async () => {
        const { component, getByText, fixture } = await setup('DENIED');

        component.isWorkPlaceRequester = true;
        fixture.detectChanges();

        const subName = component.notification.typeContent.subEstablishmentName;

        const rejectedText = getByText(`You have rejected a request from ${subName} to link to you.`);
        const rejectedReasonText = getByText('No reason provided.');

        expect(rejectedText).toBeTruthy();
        expect(rejectedReasonText).toBeTruthy();
      });
    });

    describe('sub notifications', () => {
      it('shows the rejected text and reason', async () => {
        const { component, getByText, fixture } = await setup('DENIED');

        component.isWorkPlaceRequester = false;
        component.notification.typeContent.rejectionReason = 'Not one of our subsidiaries';
        fixture.detectChanges();

        const parentName = component.notification.typeContent.parentEstablishmentName;
        const parentPostCode = component.notification.typeContent.parentPostCode;

        const rejectedText = getByText(`${parentName}, ${parentPostCode} has rejected your request to link to them.`);
        const rejectedReasonText = getByText(component.notification.typeContent.rejectionReason);

        expect(rejectedText).toBeTruthy();
        expect(rejectedReasonText).toBeTruthy();
      });

      it('shows the rejected text and no reason', async () => {
        const { component, getByText, fixture } = await setup('DENIED');

        component.isWorkPlaceRequester = false;
        fixture.detectChanges();

        const parentName = component.notification.typeContent.parentEstablishmentName;
        const parentPostCode = component.notification.typeContent.parentPostCode;

        const rejectedText = getByText(`${parentName}, ${parentPostCode} has rejected your request to link to them.`);
        const rejectedReasonText = getByText('No reason provided.');

        expect(rejectedText).toBeTruthy();
        expect(rejectedReasonText).toBeTruthy();
      });
    });
  });

  describe('link to parent is approved', () => {
    it('should show the parent name and postcode in the sub notification', async () => {
      const { component, getByText } = await setup();

      const parentName = component.notification.typeContent.parentEstablishmentName;
      const parentPostCode = component.notification.typeContent.parentPostCode;

      const parentNameAndPostCodeText = `Your request to link to ${parentName}, ${parentPostCode}, has been approved.`;

      expect(getByText(parentNameAndPostCodeText)).toBeTruthy();
    });

    it('should show the sub name and postcode in the parent notification', async () => {
      const { component, fixture, getByText } = await setup();

      const subName = component.notification.typeContent.subEstablishmentName;
      const subPostCode = component.notification.typeContent.subPostCode;
      const approvalDate = '14 December 2023 at 5:23pm';

      component.isWorkPlaceRequester = true;
      fixture.detectChanges();

      const parentApprovedRequestLinkText = getByText(
        `You approved a link request from ${subName}, ${subPostCode}, on ${approvalDate}.`,
      );

      expect(parentApprovedRequestLinkText).toBeTruthy();
    });
  });
});
