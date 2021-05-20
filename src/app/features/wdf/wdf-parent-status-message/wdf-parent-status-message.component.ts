import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-wdf-parent-status-message',
  templateUrl: './wdf-parent-status-message.component.html',
})
export class WdfParentStatusMessageComponent {
  @Input() wdfStartDate: string;
  @Input() wdfEndDate: string;
  @Input() overallEligibilityStatus: boolean;
  @Input() currentEligibilityStatus: boolean;
}
