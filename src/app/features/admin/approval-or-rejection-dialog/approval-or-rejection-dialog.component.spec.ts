import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ApprovalOrRejectionDialogComponent } from './approval-or-rejection-dialog.component';

describe('ApprovalOrRejectionDialogComponent', () => {
  async function setup(isApproval = true) {
    const { fixture, getByText } = await render(ApprovalOrRejectionDialogComponent, {
      imports: [SharedModule],
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: {
            isApproval,
            workplaceName: 'Testing Village',
            approvalType: 'registration request',
          },
        },
        {
          provide: Dialog,
          useValue: {
            close() {
              return null;
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;
    const closeDialogSpy = spyOn(component, 'closeDialogWindow').and.callThrough();

    return {
      fixture,
      component,
      getByText,
      closeDialogSpy,
    };
  }

  it('should render a ApprovalOrRejectionDialogComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Displaying dynamic text', async () => {
    it('should display workplace name passed into component', async () => {
      const { getByText } = await setup();

      expect(getByText('Testing Village')).toBeTruthy();
    });
  });

  describe('Approval', async () => {
    it('should display about to approve message', async () => {
      const { getByText } = await setup();

      const approvalMessage = `You're about to approve this registration request`;

      expect(getByText(approvalMessage)).toBeTruthy();
    });

    it('should call closeDialogWindow with true when Approve this request button pressed', async () => {
      const { getByText, closeDialogSpy } = await setup();

      const approveButton = getByText('Approve this request');
      fireEvent.click(approveButton);

      expect(closeDialogSpy.calls.mostRecent().args[1]).toEqual(true);
    });
  });

  describe('Rejection', async () => {
    it('should display about to reject message', async () => {
      const { getByText } = await setup(false);

      const rejectionMessage = `You're about to reject this registration request`;

      expect(getByText(rejectionMessage)).toBeTruthy();
    });

    it('should call closeDialogWindow with true when Reject this request button pressed', async () => {
      const { getByText, closeDialogSpy } = await setup(false);

      const approveButton = getByText('Reject this request');
      fireEvent.click(approveButton);

      expect(closeDialogSpy.calls.mostRecent().args[1]).toEqual(true);
    });
  });

  it('should call closeDialogWindow with null when Cancel button pressed', async () => {
    const { getByText, closeDialogSpy } = await setup();

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(closeDialogSpy.calls.mostRecent().args[1]).toEqual(null);
  });
});
