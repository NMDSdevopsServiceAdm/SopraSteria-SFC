import { Component, Input } from '@angular/core';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-qualifications-and-training',
  templateUrl: './qualifications-and-training.component.html',
})
export class QualificationsAndTrainingComponent extends StaffRecordSummaryComponent {
  @Input() wdfView = false;

  get displaySocialCareQualifications() {
    return this.worker.qualificationInSocialCare === 'Yes';
  }

  get displayOtherQualifications() {
    return this.worker.otherQualification === 'Yes';
  }
}
