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
  @Input() public continueRoute: string[] = null;

  public showWdfConfirmations: any = {
    contract: null,
    mainJob: null,
  };

  public getMandatoryDetailsRoute(path: string): Array<string> {
    if (path) {
      return ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid, 'mandatory-details', path];
    }
  }

  protected setShowWdfConfirmations(): void {
    this.showWdfConfirmations = {
      contract: this.showWdfConfirmation('contract'),
      mainJob: this.showWdfConfirmation('mainJob'),
    };
  }

  ngOnChanges(): void {
    this.setShowWdfConfirmations();
  }
}
