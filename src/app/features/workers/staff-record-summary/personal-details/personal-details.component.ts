import { Component } from '@angular/core';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@core/constants/constants';
import * as moment from 'moment';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
})
export class PersonalDetailsComponent extends StaffRecordSummaryComponent {
  get displayBritishCitizenship() {
    return !(this.worker.nationality && this.worker.nationality.value === 'British');
  }

  get dob() {
    return moment(this.worker.dateOfBirth).format(DEFAULT_DATE_DISPLAY_FORMAT);
  }
}
