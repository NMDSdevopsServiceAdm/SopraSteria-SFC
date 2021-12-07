import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { CqcIndividualMainServiceChangeComponent } from './cqc-individual-main-service-change.component';

describe('CqcIndividualMainServiceChangeComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(CqcIndividualMainServiceChangeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
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
});
