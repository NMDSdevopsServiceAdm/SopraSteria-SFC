import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { CqcIndividualMainServiceChangeComponent } from './cqc-individual-main-service-change.component';

describe('CqcIndividualMainServiceChangeComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(CqcIndividualMainServiceChangeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [AlertService, WindowRef],
    });

    const component = fixture.componentInstance;
    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      alertServiceSpy,
    };
  }

  it('should render a CqcIndividualMainServiceChangeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Approvals', () => {
    it('shows dialog with approval confirmation message when Approve button is clicked', async () => {
      const { fixture, getByText } = await setup();

      const approveButton = getByText('Approve');
      const dialogMessage = `You're about to approve this CQC main service change`;

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');

      expect(dialog).toBeTruthy();
      expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
    });

    it('should show approval alert when approval confirmed', async () => {
      const { fixture, getByText, alertServiceSpy } = await setup();

      const approveButton = getByText('Approve');

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const approvalConfirmButton = within(dialog).getByText('Approve this change');

      fireEvent.click(approvalConfirmButton);

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `The main service change of workplace 'Stub Workplace' has been approved`,
      });
    });
  });

  describe('Rejections', () => {
    it('shows dialog with rejection confirmation message when Reject button is clicked', async () => {
      const { fixture, getByText } = await setup();

      const rejectButton = getByText('Reject');
      const dialogMessage = `You're about to reject this CQC main service change`;

      fireEvent.click(rejectButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');

      expect(dialog).toBeTruthy();
      expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
    });
  });

  it('should show rejection alert when rejection confirmed', async () => {
    const { fixture, getByText, alertServiceSpy } = await setup();

    const rejectButton = getByText('Reject');

    fireEvent.click(rejectButton);
    fixture.detectChanges();

    const dialog = await within(document.body).findByRole('dialog');
    const rejectionConfirmButton = within(dialog).getByText('Reject this change');

    fireEvent.click(rejectionConfirmButton);

    expect(alertServiceSpy).toHaveBeenCalledWith({
      type: 'success',
      message: `The main service change of workplace 'Stub Workplace' has been rejected`,
    });
  });
});
