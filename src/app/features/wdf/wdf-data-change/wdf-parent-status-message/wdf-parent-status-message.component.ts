import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-wdf-parent-status-message',
  templateUrl: './wdf-parent-status-message.component.html',
})
export class WdfParentStatusMessageComponent {
  @Input() public wdfStartDate: string;
  @Input() public wdfEndDate: string;
  @Input() public overallEligibilityStatus: boolean;
  @Input() public currentEligibilityStatus: boolean;
}
