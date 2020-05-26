import { SharedModule } from '@shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { render, within } from '@testing-library/angular';
import { spy } from 'sinon';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { Observable } from 'rxjs/Observable';

import { ParentRequestComponent } from './parent-request.component';

const testParentRequestId = 9999;
const testParentRequestUuid = '360c62a1-2e20-410d-a72b-9d4100a11f4e';
const testUsername = 'Mary Poppins';
const testOrgname = 'Fawlty Towers';
const testUserId = 1111;
const testEstablishmentId = 2222;
const testEstablishmentUid = '9efce151-6167-4e99-9cbf-0b9f8ab987fa';
const testWorkplaceId = 'B1234567';
const testRequestedDate = new Date();
const parentRequest = {
  requestId: testParentRequestId,
  requestUUID: testParentRequestUuid,
  establishmentId: testEstablishmentId,
  establishmentUid: testEstablishmentUid,
  userId: testUserId,
  workplaceId: testWorkplaceId,
  username: testUsername,
  orgName: testOrgname,
  requested: testRequestedDate
};

const approveButtonText = 'Approve';
const rejectButtonText = 'Reject';
const modalApproveText = 'Approve request';
const modalRejectText = 'Reject request';

fdescribe('ParentRequestComponent', () => {

  async function getParentRequestComponent() {
    return render(ParentRequestComponent, {
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef
        },
      ],
      componentProperties: {
        index: 0,
        removeParentRequest: {
          emit: spy(),
        } as any,
        parentRequest,
      },
    });
  }

  async function clickFirstApproveButton() {
    const component = await getParentRequestComponent();
    component.getByText(approveButtonText).click();
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    return { component, modalConfirmationDialog };
  }

  async function clickFirstRejectButton() {
    const component = await getParentRequestComponent();
    component.getByText(rejectButtonText).click();
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    return { component, modalConfirmationDialog };
  }

  it('should create', async() => {
    // Act
    const component = await getParentRequestComponent();
    
    // Assert
    expect(component).toBeTruthy();
  });

  it('should be able to approve a become-a-parent request', async () => {
    // Arrange
    const { component, modalConfirmationDialog } = await clickFirstApproveButton();
    const parentRequestApproval = spyOn(component.fixture.componentInstance.parentRequestsService, 'parentApproval').and.callThrough();

    // Act
    within(modalConfirmationDialog).getByText(modalApproveText).click();
    
    // Assert
    expect(parentRequestApproval).toHaveBeenCalledWith({
      parentRequestId: testParentRequestId,
      establishmentId: testEstablishmentId,
      userId: testUserId,
      rejectionReason: 'Approved',
      approve: true,
    });
  });

  it('should be able to reject a become-a-parent request', async () => {
    // Arrange
    const { component, modalConfirmationDialog } = await clickFirstRejectButton();
    const parentRequestApproval = spyOn(component.fixture.componentInstance.parentRequestsService, 'parentApproval').and.callThrough();
    
    // Act
    within(modalConfirmationDialog).getByText(modalRejectText).click();
    
    // Assert
    expect(parentRequestApproval).toHaveBeenCalledWith({
      parentRequestId: testParentRequestId,
      establishmentId: testEstablishmentId,
      userId: testUserId,
      rejectionReason: 'Rejected',
      approve: false,
    });
  });

  it('should show confirmation modal when approving a request', async () => {
    // Arrange
    const component = await getParentRequestComponent();
    const confirmationModal = spyOn(component.fixture.componentInstance.dialogService, 'open').and.callThrough();
    
    // Act
    component.getByText(approveButtonText).click();

    // Teardown
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    within(modalConfirmationDialog).getByText(modalApproveText).click();
    
    // Assert
    expect(confirmationModal).toHaveBeenCalled();
  });

  it('confirmation modal should display org name when approving a request', async () => {
    // Act
    const { modalConfirmationDialog } = await clickFirstApproveButton();
    const paragraph = within(modalConfirmationDialog).getByTestId("parent-confirm-para");
    
    // Teardown
    within(modalConfirmationDialog).getByText(modalApproveText).click();
    
    // Assert
    expect(paragraph.innerHTML).toContain(`If you do this, ${testOrgname} will become a parent workplace`);
  });

  it('confirmation modal should display org name when rejecting a request', async () => {
    // Act
    const { modalConfirmationDialog } = await clickFirstRejectButton();
    const paragraph = within(modalConfirmationDialog).getByTestId("parent-confirm-para");
    
    // Teardown
    within(modalConfirmationDialog).getByText(modalRejectText).click();
    
    // Assert
    expect(paragraph.innerHTML).toContain(`If you do this, ${testOrgname} will not become a parent workplace`);
  });

  it('confirmation modal should show "Approve request" when approving a request', async () => {
    // Act
    const { modalConfirmationDialog } = await clickFirstApproveButton();
    const approveHeading = within(modalConfirmationDialog).getByTestId("parent-confirm-heading");
    const submitButton = within(modalConfirmationDialog).getByText(modalApproveText);
    
    // Teardown
    within(modalConfirmationDialog).getByText(modalApproveText).click();
    
    // Assert
    expect(approveHeading.innerHTML).toContain("You're about to approve this request.");
    expect(submitButton).toBeTruthy();
  });

  it('confirmation modal should show "Reject request" when rejecting a request', async () => {
    // Act
    const { modalConfirmationDialog } = await clickFirstRejectButton();
    const rejectHeading = within(modalConfirmationDialog).getByTestId("parent-confirm-heading");
    const submitButton = within(modalConfirmationDialog).getByText(modalRejectText);
    
    // Teardown
    within(modalConfirmationDialog).getByText(modalRejectText).click();
    
    // Assert
    expect(rejectHeading.innerHTML).toContain("You're about to reject this request.");
    expect(submitButton).toBeTruthy();
  });

  it('confirmation message should be shown after approving a request', async () => {
    // Arrange
    const { component, modalConfirmationDialog } = await clickFirstApproveButton();
    const addAlert = spyOn(component.fixture.componentInstance.alertService, 'addAlert').and.callThrough();
    spyOn(component.fixture.componentInstance.parentRequestsService, 'parentApproval').and.returnValue(of({}));
    
    // Act
    within(modalConfirmationDialog).getByText(modalApproveText).click();
    component.fixture.detectChanges(); 
    
    // Assert
    expect(addAlert).toHaveBeenCalledWith({
      type: 'success',
      message: `Parent request approved for ${testOrgname}.`,
    });
  });

  it('confirmation message should be shown after rejecting a request', async () => {
    // Arrange
    const { component, modalConfirmationDialog } = await clickFirstRejectButton();
    const addAlert = spyOn(component.fixture.componentInstance.alertService, 'addAlert').and.callThrough();
    spyOn(component.fixture.componentInstance.parentRequestsService, 'parentApproval').and.returnValue(of({}));
    
    // Act
    within(modalConfirmationDialog).getByText(modalRejectText).click();
    component.fixture.detectChanges(); 
    
    // Assert
    expect(addAlert).toHaveBeenCalledWith({
      type: 'success',
      message: `Parent request rejected for ${testOrgname}.`,
    });
  });

  it('should load notifications if user name not populated.', async () => {
    // Arrange
    parentRequest.username = null;
    const component = await getParentRequestComponent();
    const notificationData = { dummyNotification: 'I am a notification' };
    const httpGet = spyOn(component.fixture.componentInstance.switchWorkplaceService.http, 'get').and.returnValue(of(notificationData));

    // common setup
    const authToken = 'This is an auth token';
    const swappedEstablishmentData = {
      headers: {
        get: (header) => { return header === 'authorization' ? authToken : null; }
      },
      body: {
        establishment: {
          uid: testEstablishmentUid
        },
      }
    };
    const httpPost = spyOn(component.fixture.componentInstance.switchWorkplaceService.http, 'post').and.returnValue(of(swappedEstablishmentData));
    const workplace = { uid: testEstablishmentUid }; 
    spyOn(Observable.prototype, 'pipe').and.returnValue(of(workplace));
    spyOn(component.fixture.componentInstance.switchWorkplaceService.notificationsService, 'getAllNotifications').and.returnValue(of([notificationData, notificationData]));
    const notificationsNext = spyOn(component.fixture.componentInstance.switchWorkplaceService.notificationsService.notifications$, 'next').and.callThrough();

    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(httpGet).toHaveBeenCalledWith(`/api/user/swap/establishment/notification/${parentRequest.workplaceId}`);
    expect(notificationsNext).toHaveBeenCalledWith(notificationData);
  });

  it('should clear permissions when switching to new workplace', async () => {
    const component = await getParentRequestComponent();
    const clearPermissions = spyOn(component.fixture.componentInstance.switchWorkplaceService.permissionsService, 'clearPermissions').and.callThrough();
    const notificationData = [{ dummyNotification: 'I am a notification' }, { dummyNotification: 'I am another notification' }];
    const setPreviousToken = spyOn(component.fixture.componentInstance.switchWorkplaceService.authService, 'setPreviousToken').and.callThrough();
    spyOn(component.fixture.componentInstance.switchWorkplaceService.http, 'get').and.returnValue(of(notificationData));
    const setState = spyOn(component.fixture.componentInstance.switchWorkplaceService.establishmentService, 'setState').and.callThrough();
    const setPrimaryWorkplace = spyOn(component.fixture.componentInstance.switchWorkplaceService.establishmentService, 'setPrimaryWorkplace').and.callThrough();
    const navigate = spyOn(component.fixture.componentInstance.switchWorkplaceService.router, 'navigate').and.callThrough();
    
    // common setup
    const authToken = 'This is an auth token';
    const swappedEstablishmentData = {
      headers: {
        get: (header) => { return header === 'authorization' ? authToken : null; }
      },
      body: {
        establishment: {
          uid: testEstablishmentUid
        },
      }
    };
    const httpPost = spyOn(component.fixture.componentInstance.switchWorkplaceService.http, 'post').and.returnValue(of(swappedEstablishmentData));
    const workplace = { uid: testEstablishmentUid }; 
    spyOn(Observable.prototype, 'pipe').and.returnValue(of(workplace));
    spyOn(component.fixture.componentInstance.switchWorkplaceService.notificationsService, 'getAllNotifications').and.returnValue(of(notificationData));
    const notificationsNext = spyOn(component.fixture.componentInstance.switchWorkplaceService.notificationsService.notifications$, 'next').and.callThrough();
    
    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(clearPermissions).toHaveBeenCalled();
    expect(setPreviousToken).toHaveBeenCalled();
    expect(component.fixture.componentInstance.switchWorkplaceService.authService.token).toEqual(authToken);
    expect(httpPost).toHaveBeenCalledWith('/api/user/swap/establishment/' + parentRequest.establishmentUid, {username: parentRequest.username}, { observe: 'response' });
    expect(notificationsNext).toHaveBeenCalledWith(notificationData);
    expect(setState).toHaveBeenCalledWith(workplace);
    expect(setPrimaryWorkplace).toHaveBeenCalledWith(workplace);
    expect(component.fixture.componentInstance.switchWorkplaceService.establishmentService.establishmentId).toEqual(testEstablishmentUid);
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
