import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Observable } from 'rxjs';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';

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
        postCode: 'postalcode',
        rejectionReason: rejectionReason,
        requestorName: 'Test sub',
        subEstablishmentId: 312,
        subEstablishmentName: 'Test sub',
        subEstablishmentUid: 'subUid',
        requestedOwnerType: 'Workplace',
      },
    };
    const { fixture, getByText, getByTestId, queryByText, getAllByText, findByText } = await render(
      NotificationLinkToParentComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
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

  it('show show the parent and postcode', async () => {
    const { component, getByText } = await setup();

    const parentName = component.notification.typeContent.parentEstablishmentName;
    const parentPostCode = component.notification.typeContent.postCode;

    const parentNameAndPostCodeText = `Your request to link to ${parentName}, ${parentPostCode} has been approved.`;

    expect(getByText(parentNameAndPostCodeText)).toBeTruthy();
  });
});
