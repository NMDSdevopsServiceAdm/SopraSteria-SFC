import { Component, Input, OnInit } from '@angular/core';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-basic-record',
  templateUrl: './basic-record.component.html',
})
export class BasicRecordComponent extends StaffRecordSummaryComponent implements OnInit {
  @Input() reportDetails;

  ngOnInit() {
    if (this.reportDetails != null && this.reportDetails.hasOwnProperty('displayWDFReport')) {
      this.reportDetails['displayWDFReport'] = true;
    }
  }
}
