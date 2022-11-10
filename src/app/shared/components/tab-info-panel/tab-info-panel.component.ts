import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-info-panel',
  templateUrl: './tab-info-panel.component.html',
  styleUrls: ['./tab-info-panel.component.scss'],
})
export class TabInfoPanelComponent implements OnInit {
  @Input() public totalExpiredTraining = 0;
  @Input() public totalExpiringTraining = 0;
  @Input() public totalStaffMissingMandatoryTraining = 0;
  public summaryColumns: number;

  ngOnInit(): void {
    this.summaryColumns = this.countColumns();
  }

  private countColumns() {
    let count = 0;
    count = this.totalExpiredTraining ? count + 1 : count;
    count = this.totalExpiringTraining ? count + 1 : count;
    count = this.totalStaffMissingMandatoryTraining ? count + 1 : count;
    return count;
  }
}
