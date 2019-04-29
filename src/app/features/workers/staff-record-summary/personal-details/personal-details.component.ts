import { Component, Input, OnInit } from '@angular/core';
import { DATE_DISPLAY_DEFAULT } from '@core/constants/constants';
import * as moment from 'moment';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
})
export class PersonalDetailsComponent extends StaffRecordSummaryComponent implements OnInit {
  @Input() reportDetails;

  ngOnInit() {
    if (this.reportDetails != null && this.reportDetails.hasOwnProperty('displayWDFReport')) {
      this.reportDetails['displayWDFReport'] = true;
    }
  }

  get displayBritishCitizenship() {
    return !(this.worker.nationality && this.worker.nationality.value === 'British');
  }

  get dob() {
    return moment(this.worker.dateOfBirth).format(DATE_DISPLAY_DEFAULT);
  }
}
