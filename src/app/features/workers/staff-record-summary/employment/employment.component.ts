import { DecimalPipe, Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DATE_DISPLAY_DEFAULT } from '@core/constants/constants';
import { Contracts } from '@core/model/contracts.enum';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  providers: [DecimalPipe],
})
export class EmploymentComponent extends StaffRecordSummaryComponent implements OnInit {
  @Input() reportDetails;

  ngOnInit() {
    if (this.reportDetails != null && this.reportDetails.hasOwnProperty('displayWDFReport')) {
      this.reportDetails['displayWDFReport'] = true;
    }
  }

  constructor(location: Location, workerService: WorkerService, private decimalPipe: DecimalPipe) {
    super(location, workerService);
  }

  get displayYearArrived() {
    return this.worker.countryOfBirth && this.worker.countryOfBirth.value !== 'United Kingdom';
  }

  get displayMentalHealthProfessional() {
    return this.workerService.hasJobRole(this.worker, 27);
  }

  get displayNursingQuestions() {
    return this.workerService.hasJobRole(this.worker, 23);
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
    return moment(this.worker.mainJobStartDate).format(DATE_DISPLAY_DEFAULT);
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
