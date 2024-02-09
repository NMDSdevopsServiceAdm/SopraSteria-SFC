import { Component, Input } from '@angular/core';

import { Worker } from '../../../../core/model/worker.model';

@Component({
  selector: 'app-wdf-staff-record-status-message',
  templateUrl: './wdf-staff-record-status-message.component.html',
})
export class WdfStaffRecordStatusMessageComponent {
  @Input() overallWdfEligibility: boolean;
  @Input() worker: Worker;
  @Input() wdfStartDate: string;
  @Input() wdfEndDate: string;
}
