import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-approvals-table',
  templateUrl: './approvals-table.component.html',
})
export class ApprovalsTableComponent {
  @Input() pendingApprovals: any;
  @Input() routerLinkUrl: string;

  public setStatusClass(status: string): string {
    return status === 'Pending' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  }
}
