import { Component, Input } from '@angular/core';
import { DATE_DISPLAY_DEFAULT } from '@core/constants/constants';
import dayjs from 'dayjs';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
})
export class PersonalDetailsComponent extends StaffRecordSummaryComponent {
  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Input() canViewNinoDob: boolean;

  public ninoHidden = true;
  public dobHidden = true;

  get displayBritishCitizenship() {
    return !(this.worker.nationality && this.worker.nationality.value === 'British');
  }

  get dob() {
    return dayjs(this.worker.dateOfBirth).format(DATE_DISPLAY_DEFAULT);
  }

  public toggleNinoHide(event) {
    event.preventDefault();
    this.ninoHidden = !this.ninoHidden;
  }

  public toggleDobHide(event) {
    event.preventDefault();
    this.dobHidden = !this.dobHidden;
  }
}
