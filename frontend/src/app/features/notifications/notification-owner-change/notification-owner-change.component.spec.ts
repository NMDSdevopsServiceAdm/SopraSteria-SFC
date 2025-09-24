import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { RejectRequestDialogComponent } from '@shared/components/reject-request-dialog/reject-request-dialog.component';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Observable } from 'rxjs';

import { NotificationOwnerChangeComponent } from './notification-owner-change.component';

describe('NotificationOwnerChangeComponent', () => {
  async function setup(approvalStatus = 'REQUESTED', rejectionReason = null, permissionRequest = 'None') {
    // TODO: stub notification data
    const notificationData = {
      notificationUid: 'SOME UID',
      typeContent: {
        requestedOwnerType: 'Workplace',
        parentEstablishmentName: 'Test Parent',
        parentEstablishmentUid: 'parentUid',
        parentPostCode: 'PR1 2EE',
        subEstablishmentName: 'Test Workplace',
        subEstablishmentUid: 'subUid',
        subPostCode: 'SB2 3JJ',
        approvalStatus,
        ownerChangeRequestUid: 'REQUEST UID',
        rejectionReason,
        permissionRequest,
        requestorName: 'Test Workplace',
      },
    };

    const { fixture, getByText, getByTestId, queryByTestId } = await render(NotificationOwnerChangeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      declarations: [NotificationTypePipe, RejectRequestDialogComponent],
      providers: [
        AlertService,
        WindowRef,
        DialogService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      provideHttpClient(), provideHttpClientTesting(),],
      componentProperties: {
        events: new Observable<string>(),
        notification: notificationData,
      },
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    injector.inject(AlertService) as AlertService;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('main message text', () => {
    it('should render the correct text when the ownership request is from a workplace and the approval status is REQUESTED', async () => {
      const { getByText, component, fixture } = await setup();

      component.isWorkPlaceIsRequester = true;
      component.workplace.name = component.notification.typeContent.parentEstablishmentName;
      fixture.detectChanges();

      expect(component.ownerShipRequestedToPostCode).toEqual(component.notification.typeContent.subPostCode);
      expect(component.ownerShipRequestedFromPostCode).toEqual(component.notification.typeContent.parentPostCode);
      expect(
        getByText(
          'Test Workplace, SB2 3JJ, have sent you a change data owner request because they want to be able to edit their own workplace details and staff records.',
        ),
      ).toBeTruthy();
    });

    it('should render the correct text when the ownership request is from a parent and the approval status is REQUESTED', async () => {
      const { getByText, component, fixture } = await setup('REQUESTED');

      component.notification.typeContent.requestedOwnerType = 'Parent';

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.ownerShipRequestedToPostCode).toEqual(component.notification.typeContent.parentPostCode);
      expect(component.ownerShipRequestedFromPostCode).toEqual(component.notification.typeContent.subPostCode);
      expect(
        getByText(
          'Test Parent, PR1 2EE, have sent you a change data owner request because they want to be able to edit your workplace details and staff records.',
        ),
      ).toBeTruthy();
    });

    it('should render the correct text when the approval status is CANCELLED', async () => {
      const { getByText } = await setup('CANCELLED');

      expect(getByText('You have a request to transfer ownership of data to Test Workplace.')).toBeTruthy();
    });

    it('should render the correct text when the approval status is DENIED and isWorkplaceIsRequester is true with no reason if not provided', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId } = await setup('DENIED');

      component.isWorkPlaceIsRequester = true;
      fixture.detectChanges();

      expect(getByText('You rejected the request to transfer ownership of data to Test Workplace')).toBeTruthy();
      expect(getByTestId('no-rejection-reason')).toBeTruthy();
      expect(queryByTestId('rejection-reason')).toBeFalsy();
    });

    it('should render the correct text when the approval status is DENIED and isWorkplaceIsRequester is true with a reason if not provided', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId } = await setup(
        'DENIED',
        'Reason for rejecting',
      );

      component.isWorkPlaceIsRequester = true;
      fixture.detectChanges();

      expect(getByText('You rejected the request to transfer ownership of data to Test Workplace')).toBeTruthy();
      expect(getByTestId('rejection-reason')).toBeTruthy();
      expect(queryByTestId('no-rejection-reason')).toBeFalsy();
    });

    it('should render the correct text when the approval status is DENIED and isWorkplaceIsRequester is false with no reason if not provided', async () => {
      const { getByText, getByTestId, queryByTestId } = await setup('DENIED');

      expect(getByText('Test Parent has rejected your request to become the data owner.')).toBeTruthy();
      expect(getByTestId('no-rejection-reason')).toBeTruthy();
      expect(queryByTestId('rejection-reason')).toBeFalsy();
    });

    it('should render the correct text when the approval status is DENIED and isWorkplaceIsRequester is false with a reason if not provided', async () => {
      const { getByText, getByTestId, queryByTestId } = await setup('DENIED', 'Reason for rejecting');

      expect(getByText('Test Parent has rejected your request to become the data owner.')).toBeTruthy();
      expect(getByTestId('rejection-reason')).toBeTruthy();
      expect(queryByTestId('no-rejection-reason')).toBeFalsy();
    });

    it('should render the correct text when the approval status is APPROVED and isWorkplaceIsRequestor is true', async () => {
      const { component, fixture, getByText } = await setup('APPROVED');

      component.isWorkPlaceIsRequester = true;
      fixture.detectChanges();

      expect(getByText('You approved the request to transfer ownership of data to Test Parent.'));
    });

    it('should render the correct text when the approval status is APPROVED and isWorkplaceIsRequestor is false', async () => {
      const { component, fixture, getByText } = await setup('APPROVED');

      component.isWorkPlaceIsRequester = false;
      fixture.detectChanges();

      expect(
        getByText(
          `Test Workplace, SB2 3JJ, approved your change data owner request and you can now edit their workplace details and staff records.`,
        ),
      );
    });
  });

  describe('table', () => {
    it('should not be rendered if the approval status is DENIED', async () => {
      const { queryByTestId } = await setup('DENIED');

      expect(queryByTestId('table')).toBeFalsy();
    });

    describe('not approved', () => {
      it('should render the correct text when the permission request is None', async () => {
        const { component, getByText, getByTestId } = await setup();

        const ownerShipRequestedFrom = component.ownerShipRequestedFrom;
        const ownerShipRequestedTo = component.ownerShipRequestedTo;

        expect(getByTestId('not-approved')).toBeTruthy();
        expect(getByText(ownerShipRequestedFrom)).toBeTruthy();
        expect(getByText('No access to data, linked only')).toBeTruthy();
        expect(getByText(ownerShipRequestedTo)).toBeTruthy();
      });

      it('should render the correct text when the permission request is Workplace', async () => {
        const { component, getByText, getByTestId } = await setup('REQUESTED', null, 'Workplace');

        const ownerShipRequestedFrom = component.ownerShipRequestedFrom;
        const ownerShipRequestedTo = component.ownerShipRequestedTo;

        expect(getByTestId('not-approved')).toBeTruthy();
        expect(getByText(ownerShipRequestedFrom)).toBeTruthy();
        expect(getByText('Workplace')).toBeTruthy();
        expect(getByText(ownerShipRequestedTo)).toBeTruthy();
      });

      it('should render the correct text when the permission request is Workplace', async () => {
        const { component, getByText, getByTestId } = await setup('REQUESTED', null, 'Workplace and Staff');

        const ownerShipRequestedFrom = component.ownerShipRequestedFrom;
        const ownerShipRequestedTo = component.ownerShipRequestedTo;

        expect(getByTestId('not-approved')).toBeTruthy();
        expect(getByText(ownerShipRequestedFrom)).toBeTruthy();
        expect(getByText('Workplace and staff records (view only)')).toBeTruthy();
        expect(getByText(ownerShipRequestedTo)).toBeTruthy();
      });
    });

    describe('approved', () => {
      it('should render the correct text when the permission request is None', async () => {
        const { component, getByText, getByTestId } = await setup('APPROVED');

        const ownerShipRequestedFrom = component.ownerShipRequestedFrom;
        const ownerShipRequestedTo = component.ownerShipRequestedTo;

        expect(getByTestId('approved')).toBeTruthy();
        expect(getByText(ownerShipRequestedFrom)).toBeTruthy();
        expect(getByText('No access to data, linked only')).toBeTruthy();
        expect(getByText(ownerShipRequestedTo)).toBeTruthy();
      });

      it('should render the correct text when the permission request is Workplace', async () => {
        const { component, getByText, getByTestId } = await setup('APPROVED', null, 'Workplace');

        const ownerShipRequestedFrom = component.ownerShipRequestedFrom;
        const ownerShipRequestedTo = component.ownerShipRequestedTo;

        expect(getByTestId('approved')).toBeTruthy();
        expect(getByText(ownerShipRequestedFrom)).toBeTruthy();
        expect(getByText('Workplace')).toBeTruthy();
        expect(getByText(ownerShipRequestedTo)).toBeTruthy();
      });

      it('should render the correct text when the permission request is Workplace', async () => {
        const { component, getByText, getByTestId } = await setup('APPROVED', null, 'Workplace and Staff');

        const ownerShipRequestedFrom = component.ownerShipRequestedFrom;
        const ownerShipRequestedTo = component.ownerShipRequestedTo;

        expect(getByTestId('approved')).toBeTruthy();
        expect(getByText(ownerShipRequestedFrom)).toBeTruthy();
        expect(getByText('Workplace and staff records (view only)')).toBeTruthy();
        expect(getByText(ownerShipRequestedTo)).toBeTruthy();
      });
    });
  });
});