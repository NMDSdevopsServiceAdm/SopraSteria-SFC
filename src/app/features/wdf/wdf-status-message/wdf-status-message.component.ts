import { Component, Input } from '@angular/core';

import { WdfEligibilityStatus } from '../../../core/model/wdf.model';

@Component({
  selector: 'app-wdf-status-message',
  templateUrl: './wdf-status-message.component.html',
})
export class WdfStatusMessageComponent {
  @Input() wdfStartDate: string;
  @Input() wdfEndDate: string;
  @Input() wdfEligibilityStatus: WdfEligibilityStatus;

  public showMeetingMessage(): boolean {
    return (
      this.wdfEligibilityStatus.overall &&
      this.wdfEligibilityStatus.currentWorkplace &&
      this.wdfEligibilityStatus.currentStaff
    );
  }

  public showMeetingWithChangesMessage(): boolean {
    return (
      this.wdfEligibilityStatus.overall &&
      !(this.wdfEligibilityStatus.currentWorkplace && this.wdfEligibilityStatus.currentStaff)
    );
  }
}
