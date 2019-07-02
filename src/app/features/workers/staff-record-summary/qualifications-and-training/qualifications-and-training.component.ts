import { Component, Input, OnInit } from '@angular/core';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-qualifications-and-training',
  templateUrl: './qualifications-and-training.component.html',
})
export class QualificationsAndTrainingComponent extends StaffRecordSummaryComponent implements OnInit {
  @Input() reportDetails;
  @Input() showAddButtons = false;

  ngOnInit() {
    if (this.reportDetails != null && this.reportDetails.hasOwnProperty('displayWDFReport')) {
      this.reportDetails['displayWDFReport'] = true;
    }
  }

  get displaySocialCareQualifications() {
    return this.worker.qualificationInSocialCare === 'Yes';
  }

  get displayOtherQualifications() {
    return this.worker.otherQualification === 'Yes';
  }
}
