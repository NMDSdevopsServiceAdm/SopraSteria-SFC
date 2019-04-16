import { DecimalPipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@core/constants/constants';
import { Contracts } from '@core/constants/contracts.enum';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  providers: [DecimalPipe],
})
export class EmploymentComponent extends StaffRecordSummaryComponent {
  constructor(location: Location, workerService: WorkerService, private decimalPipe: DecimalPipe) {
    super(location, workerService);
  }

  get displayYearArrived() {
    return this.worker.countryOfBirth && this.worker.countryOfBirth.value !== 'United Kingdom';
  }

  get displayMentalHealthProfessional() {
    return (
      this.worker.mainJob.title === 'Social Worker' ||
      (this.worker.otherJobs && this.worker.otherJobs.find(j => j.title === 'Social Worker'))
    );
  }

  get displayDaysSickness() {
    return [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract);
  }

  get displayAverageWeeklyHours() {
    return (
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
    );
  }

  get displayWeeklyContractedHours() {
    return !this.displayAverageWeeklyHours;
  }

  get mainStartDate() {
    return moment(this.worker.mainJobStartDate).format(DEFAULT_DATE_DISPLAY_FORMAT);
  }

  get salary() {
    let format = '1';
    switch (this.worker.annualHourlyPay.value) {
      case 'Annually':
        format = '1.0-0';
        break;
      case 'Hourly':
        format = '1.2-2';
        break;
    }
    const formatted = this.decimalPipe.transform(this.worker.annualHourlyPay.rate, format);
    return `£${formatted} ${this.worker.annualHourlyPay.value}`;
  }
}
