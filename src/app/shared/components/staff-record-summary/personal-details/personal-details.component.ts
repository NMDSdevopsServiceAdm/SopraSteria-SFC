import { Component, Input } from '@angular/core';
import { DATE_DISPLAY_DEFAULT } from '@core/constants/constants';
import * as moment from 'moment';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
})
export class PersonalDetailsComponent extends StaffRecordSummaryComponent {
  @Input() wdfView = false;

  get displayBritishCitizenship() {
    return !(this.worker.nationality && this.worker.nationality.value === 'British');
  }

  get dob() {
    return moment(this.worker.dateOfBirth).format(DATE_DISPLAY_DEFAULT);
  }
}
