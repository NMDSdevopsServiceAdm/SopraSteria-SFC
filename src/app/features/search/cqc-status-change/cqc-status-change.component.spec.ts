import { SharedModule } from '@shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { render, within } from '@testing-library/angular';
import { spy } from 'sinon';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';

import { CqcStatusChangeComponent } from './cqc-status-change.component';
import { CqcStatusChange } from '@core/model/cqc-status-change.model';

const testChangeRequestId = 9999;
const testParentRequestUuid = '360c62a1-2e20-410d-a72b-9d4100a11f4e';
const testUsername = 'Mary Poppins';
const testOrgname = 'Fawlty Towers';
const testUserId = 1111;
const testEstablishmentId = 2222;
const testEstablishmentUid = '9efce151-6167-4e99-9cbf-0b9f8ab987fa';
const testWorkplaceId = 'B1234567';
const testRequestedDate = new Date();

const approveButtonText = 'Approve';
const rejectButtonText = 'Reject';
const modalApproveText = 'Approve request';
const modalRejectText = 'Reject request';

function cqcStatusChangeGenerator(otherCurrentService = false, otherRequestedService = false, usernameNull = false) {
  const payload = {
    requestId: testChangeRequestId,
    requestUUID: testParentRequestUuid,
    establishmentId: testEstablishmentId,
    establishmentUid: testEstablishmentUid,
    userId: testUserId,
    workplaceId: testWorkplaceId,
    username: testUsername,
    orgName: testOrgname,
    requested: testRequestedDate,
    status: 'Pending',
    currentService: {
      ID: 1,
      name: 'Carers support',
    },
    requestedService: {
      ID: 2,
      name: 'Service Name'
    }
  } as CqcStatusChange;
  if (otherCurrentService) {
    payload.currentService = {
      ID: 5,
      name: 'Other Service',
      other: 'Other Service Name'
    };
  }
  if (otherRequestedService) {
    payload.requestedService = {
      ID: 6,
      name: 'Other Service',
      other: 'Other Service Name'
    };
    if (usernameNull) {
      payload.username = null;
    }
  }
  return payload;
}

fdescribe('CqcStatusChangeComponent', () => {

  async function getCqcStatusChangeComponent(otherCurrentService = false, otherRequestedService= false, usernameNull = false) {
    return render(CqcStatusChangeComponent, {
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef
        },
      ],
      componentProperties: {
        index: 0,
        removeCqcStatusChanges: {
          emit: spy(),
        } as any,
        cqcStatusChange: cqcStatusChangeGenerator(otherCurrentService, otherRequestedService, usernameNull),
      },
    });
  }
  async function clickFirstApproveButton() {
    const component = await getCqcStatusChangeComponent();
    component.getByText(approveButtonText).click();
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    return { component, modalConfirmationDialog };
  }

  async function clickFirstRejectButton() {
    const component = await getCqcStatusChangeComponent();
    component.getByText(rejectButtonText).click();
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    return { component, modalConfirmationDialog };
  }

  it('should create', async () => {
    // Act
    const component = await getCqcStatusChangeComponent();

    // Assert
    expect(component).toBeTruthy();
  });

  it('should show up requested service name if requested service has an \'other\' type ', async () => {
    const otherCurrentService = false;
    const otherRequestedService = true;
    const component = await getCqcStatusChangeComponent(otherCurrentService , otherRequestedService);
    const otherServiceTitle = await within(document.body).findByTestId('cqc-requested-service-other-title');
    const otherServiceValue = await within(document.body).findByTestId('cqc-requested-service-other-value');
    const cqcStatusChange = cqcStatusChangeGenerator(otherCurrentService , otherRequestedService);
    expect(otherServiceTitle.innerHTML).toContain(`Requested Service Name`);
    expect(otherServiceValue.innerHTML).toContain(cqcStatusChange.requestedService.other);

  });
  it('shouldn\'t show up current service name if current service doesnt an \'other\' type ', async () => {

    const component = await getCqcStatusChangeComponent();

    const currentServiceTitle = await within(document.body).queryByTestId('cqc-current-service-other-title');
    const currentServiceValue = await within(document.body).queryByTestId('cqc-current-service-other-value');

    expect(currentServiceTitle).toBeNull();
    expect(currentServiceValue).toBeNull();

  });
  it('should be able to approve a CQC Status Change request', async () => {
    // Arrange
    const { component, modalConfirmationDialog } = await clickFirstApproveButton();
    const cqcStatusChangeApproval = spyOn(component.fixture.componentInstance.cqcStatusChangeService, 'CqcStatusChangeApproval').and.callThrough();

    // Act
    within(modalConfirmationDialog).getByText(modalApproveText).click();

    // Assert
    expect(cqcStatusChangeApproval).toHaveBeenCalledWith({
      approvalId: testChangeRequestId,
      establishmentId: testEstablishmentId,
      userId: testUserId,
      rejectionReason: 'Approved',
      approve: true,
    });
  });

  it('should be able to reject a CQC Status Change request', async () => {
    // Arrange
    const { component, modalConfirmationDialog } = await clickFirstRejectButton();
    const cqcSatusChangeApproval = spyOn(component.fixture.componentInstance.cqcStatusChangeService, 'CqcStatusChangeApproval').and.callThrough();

    // Act
    within(modalConfirmationDialog).getByText(modalRejectText).click();

    // Assert
    expect(cqcSatusChangeApproval).toHaveBeenCalledWith({
      approvalId: testChangeRequestId,
      establishmentId: testEstablishmentId,
      userId: testUserId,
      rejectionReason: 'Rejected',
      approve: false,
    });
  });

  it('should show confirmation modal when approving a request', async () => {
    // Arrange
    const component = await getCqcStatusChangeComponent();
    const confirmationModal = spyOn(component.fixture.componentInstance.dialogService, 'open').and.callThrough();

    // Act
    component.getByText(approveButtonText).click();

    // Teardown
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    within(modalConfirmationDialog).getByText(modalApproveText).click();

    // Assert
    expect(confirmationModal).toHaveBeenCalled();
  });

  it('confirmation modal should display org name and requested service when approving a request', async () => {
    // Act
    const { modalConfirmationDialog } = await clickFirstApproveButton();
    const paragraph = within(modalConfirmationDialog).getByTestId('cqc-confirm-para');
    const cqcStatusChange = cqcStatusChangeGenerator();

    // Teardown
    within(modalConfirmationDialog).getByText(modalApproveText).click();

    // Assert
    expect(paragraph.innerHTML).toContain(`If you do this, ${testOrgname} will be flagged as CQC regulated and their new main service will be ${cqcStatusChange.requestedService.name}.`);
  });

  it('confirmation modal should display org name when rejecting a request', async () => {
    // Act
    const { modalConfirmationDialog } = await clickFirstRejectButton();
    const paragraph = within(modalConfirmationDialog).getByTestId('cqc-confirm-para');
    const cqcStatusChange = cqcStatusChangeGenerator();

    // Teardown
    within(modalConfirmationDialog).getByText(modalRejectText).click();

    // Assert
    expect(paragraph.innerHTML).toContain(`If you do this, ${testOrgname} will not be flagged as CQC regulated and their main service will still be ${cqcStatusChange.currentService.name}.`);
  });

  it('confirmation modal should show "Approve request" when approving a request', async () => {
    // Act
    const { modalConfirmationDialog } = await clickFirstApproveButton();
    const approveHeading = within(modalConfirmationDialog).getByTestId('CQC-confirm-heading');
    const submitButton = within(modalConfirmationDialog).getByText(modalApproveText);

    // Teardown
    within(modalConfirmationDialog).getByText(modalApproveText).click();

    // Assert
    expect(approveHeading.innerHTML).toContain('You\'re about to approve this request.');
    expect(submitButton).toBeTruthy();
  });

  it('confirmation modal should show "Reject request" when rejecting a request', async () => {
    // Act
    const { modalConfirmationDialog } = await clickFirstRejectButton();
    const rejectHeading = within(modalConfirmationDialog).getByTestId('CQC-confirm-heading');
    const submitButton = within(modalConfirmationDialog).getByText(modalRejectText);

    // Teardown
    within(modalConfirmationDialog).getByText(modalRejectText).click();

    // Assert
    expect(rejectHeading.innerHTML).toContain('You\'re about to reject this request.');
    expect(submitButton).toBeTruthy();
  });

  it('confirmation message should be shown after approving a request', async () => {
    // Arrange
    const { component, modalConfirmationDialog } = await clickFirstApproveButton();
    const addAlert = spyOn(component.fixture.componentInstance.alertService, 'addAlert').and.callThrough();
    spyOn(component.fixture.componentInstance.cqcStatusChangeService, 'CqcStatusChangeApproval').and.returnValue(of({}));

    // Act
    within(modalConfirmationDialog).getByText(modalApproveText).click();
    component.fixture.detectChanges();

    // Assert
    expect(addAlert).toHaveBeenCalledWith({
      type: 'success',
      message: `You\'ve approved the main service change for ${testOrgname}.`
    });
  });

  it('confirmation message should be shown after rejecting a request', async () => {
    // Arrange
    const { component, modalConfirmationDialog } = await clickFirstRejectButton();
    const addAlert = spyOn(component.fixture.componentInstance.alertService, 'addAlert').and.callThrough();
    spyOn(component.fixture.componentInstance.cqcStatusChangeService, 'CqcStatusChangeApproval').and.returnValue(of({}));

    // Act
    within(modalConfirmationDialog).getByText(modalRejectText).click();
    component.fixture.detectChanges();

    // Assert
    expect(addAlert).toHaveBeenCalledWith({
      type: 'success',
      message: `You\'ve rejected the main service change for ${testOrgname}.`,
    });
  });

});

