import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-approvals-table',
  templateUrl: './approvals-table.component.html',
})
export class ApprovalsTableComponent implements OnInit {
  @Input() pendingApprovals: any;

  constructor() {}

  ngOnInit(): void {
    console.log(this.pendingApprovals);
  }

  public setStatusClass(status: string): string {
    return status === 'Pending' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  }
}
