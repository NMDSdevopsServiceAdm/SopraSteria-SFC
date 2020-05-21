import { SharedModule } from '@shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { render, within } from '@testing-library/angular';
import { spy } from 'sinon';
import { AlertService } from '@core/services/alert.service';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { getTestBed } from '@angular/core/testing';

import { ParentRequestComponent } from './parent-request.component';

const testUsername = 'Mary Poppins';
const testOrgname = 'Fawlty Towers';
const testUserId = 1111;
const testEstablishmentId = 2222;
const testWorkplaceId = 'B1234567';
const testRequestedDate = new Date();

const approveButtonText = 'Approve';
const rejectButtonText = 'Reject';
const modalApproveText = 'Approve request';
const modalRejectText = 'Reject request';

fdescribe('ParentRequestComponent', () => {

  async function getParentRequestComponent() {
    const parentRequest = {
      establishmentId: testEstablishmentId,
      userId: testUserId,
      workplaceId: testWorkplaceId,
      userName: testUsername,
      orgName: testOrgname,
      requested: testRequestedDate
    };

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

  /*it('should create', async() => {
    const component = await getParentRequestComponent();

    expect(component).toBeTruthy();
  });*/

  it('should be able to approve a become-a-parent request', async () => {
    const component = await getParentRequestComponent();

    const { componentInstance } = component.fixture;
    const parentRequestApproval = spyOn(componentInstance.parentRequestsService, 'parentApproval').and.callThrough();
    
    const approveButton = component.getByText(approveButtonText);
    approveButton.click();
    
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    within(modalConfirmationDialog).getByText(modalApproveText).click();

    expect(parentRequestApproval).toHaveBeenCalledWith({
      establishmentId: testEstablishmentId,
      userId: testUserId,
      rejectionReason: 'Approved',
      approve: true,
    });
  });

  it('should be able to reject a become-a-parent request', async () => {
    const component = await getParentRequestComponent();

    const { componentInstance } = component.fixture;
    const parentRequestApproval = spyOn(componentInstance.parentRequestsService, 'parentApproval').and.callThrough();
    
    const rejectButton = component.getByText(rejectButtonText);
    rejectButton.click();
    
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    within(modalConfirmationDialog).getByText(modalRejectText).click();

    expect(parentRequestApproval).toHaveBeenCalledWith({
      establishmentId: testEstablishmentId,
      userId: testUserId,
      rejectionReason: 'Rejected',
      approve: false,
    });
  });

  it('should show confirmation modal when approving a request', async () => {
    const { click, getByText, fixture } = await getParentRequestComponent();

    const { componentInstance: component } = fixture;

    const confirmationModal = spyOn(component.dialogService, 'open').and.callThrough();

    click(getByText(approveButtonText));
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    within(modalConfirmationDialog).getByText(modalApproveText).click();

    expect(confirmationModal).toHaveBeenCalled();
  });

  it('confirmation modal should display org name when approving a request', async () => {
    const component = await getParentRequestComponent();
    
    const approveButton = component.getByText(approveButtonText);
    approveButton.click();
    
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    const paragraph = within(modalConfirmationDialog).getByTestId("parent-confirm-para");
    within(modalConfirmationDialog).getByText(modalApproveText).click();

    expect(paragraph.innerHTML).toContain(`If you do this, ${testOrgname} will become a parent workplace`);
  });

  it('confirmation modal should display org name when rejecting a request', async () => {
    const component = await getParentRequestComponent();
    
    const rejectButton = component.getByText(rejectButtonText);
    rejectButton.click();
    
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    const paragraph = within(modalConfirmationDialog).getByTestId("parent-confirm-para");
    within(modalConfirmationDialog).getByText(modalRejectText).click();
    
    expect(paragraph.innerHTML).toContain(`If you do this, ${testOrgname} will not become a parent workplace`);
  });

  it('confirmation modal should show "Approve request" when approving a request', async () => {
    const component = await getParentRequestComponent();
    
    const approveButton = component.getByText(approveButtonText);
    approveButton.click();
    
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    const approveHeading = within(modalConfirmationDialog).getByTestId("parent-confirm-heading");
    const submitButton = within(modalConfirmationDialog).getByText(modalApproveText);
    within(modalConfirmationDialog).getByText(modalApproveText).click();
    
    expect(approveHeading.innerHTML).toContain("You're about to approve this request.");
    expect(submitButton).toBeTruthy();
  });

  it('confirmation modal should show "Reject request" when rejecting a request', async () => {
    const component = await getParentRequestComponent();
    
    const rejectButton = component.getByText(rejectButtonText);
    rejectButton.click();
    
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    const rejectHeading = within(modalConfirmationDialog).getByTestId("parent-confirm-heading");
    const submitButton = within(modalConfirmationDialog).getByText(modalRejectText);
    within(modalConfirmationDialog).getByText(modalRejectText).click();

    expect(rejectHeading.innerHTML).toContain("You're about to reject this request.");
    expect(submitButton).toBeTruthy();
  });

  it('confirmation message should be shown after approving a request', async () => {
    const component = await getParentRequestComponent();
    
    const { componentInstance } = component.fixture;
    const addAlert = spyOn(componentInstance.alertService, 'addAlert').and.callThrough();
    
    const approveButton = component.getByText(approveButtonText);
    approveButton.click();
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    within(modalConfirmationDialog).getByText(modalApproveText).click();

    expect(addAlert).toHaveBeenCalledWith({
      type: 'success',
      message: `You have approved the request for ${testOrgname} to become a parent workplace.`,
    });
  });

  it('confirmation message should be shown after rejecting a request', async () => {
    const component = await getParentRequestComponent();
    
    const { componentInstance } = component.fixture;
    const addAlert = spyOn(componentInstance.alertService, 'addAlert').and.callThrough();
    
    const approveButton = component.getByText(rejectButtonText);
    approveButton.click();
    const modalConfirmationDialog = await within(document.body).findByRole('dialog');
    within(modalConfirmationDialog).getByText(modalRejectText).click();

    expect(addAlert).toHaveBeenCalledWith({
      type: 'success',
      message: `You have rejected the request for ${testOrgname} to become a parent workplace.`,
    });
  });
});
