import { Component, Input } from '@angular/core';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-basic-record',
  templateUrl: './basic-record.component.html',
})
export class BasicRecordComponent extends StaffRecordSummaryComponent {
  @Input() public wdfView = false;
  @Input() public basicTitle = '';
  @Input() public overallWdfEligibility: boolean;
  @Input() public canEditWorker: boolean;
  @Input() public mandatoryDetailsPage = false;

  public getMandatoryDetailsRoute(): Array<string> {
    return ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid, 'mandatory-details', 'staff-details'];
  }
}
