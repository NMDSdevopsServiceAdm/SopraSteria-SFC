import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-wdf-status-message',
  templateUrl: './wdf-status-message.component.html',
})
export class WdfStatusMessageComponent {
  @Input() wdfStartDate: string;
  @Input() wdfEndDate: string;
  @Input() overallWdfEligibility: boolean;
  @Input() workplaceWdfEligibility: boolean;
  @Input() staffWdfEligibility: boolean;

  public showMeetingMessage(): boolean {
    return this.overallWdfEligibility && this.workplaceWdfEligibility && this.staffWdfEligibility;
  }

  public showMeetingWithChangesMessage(): boolean {
    return this.overallWdfEligibility && !(this.workplaceWdfEligibility && this.staffWdfEligibility);
  }
}
