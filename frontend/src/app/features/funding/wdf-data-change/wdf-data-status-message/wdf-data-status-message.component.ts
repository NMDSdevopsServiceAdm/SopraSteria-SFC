import { Component, Input } from '@angular/core';

import { WdfEligibilityStatus } from '../../../../core/model/wdf.model';

@Component({
  selector: 'app-wdf-data-status-message',
  templateUrl: './wdf-data-status-message.component.html',
})
export class WdfDataStatusMessageComponent {
  @Input() public wdfStartDate: string;
  @Input() public wdfEndDate: string;
  @Input() public wdfEligibilityStatus: WdfEligibilityStatus;
  @Input() public isStandalone: boolean;
}
