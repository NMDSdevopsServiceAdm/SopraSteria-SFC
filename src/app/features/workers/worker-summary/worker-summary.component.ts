import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import * as moment from 'moment';

@Component({
  selector: 'app-worker-summary',
  templateUrl: './worker-summary.component.html',
  styleUrls: ['./worker-summary.component.scss'],
})
export class WorkerSummaryComponent implements OnInit {
  private worker: Worker;

  constructor(private location: Location, private route: ActivatedRoute, private router: Router) {}

  get displaySocialCareQualifications() {
    return this.worker.qualificationInSocialCare === 'Yes';
  }

  get displayOtherQualifications() {
    return this.worker.otherQualification === 'Yes';
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

  get displayYearArrived() {
    return this.worker.countryOfBirth && this.worker.countryOfBirth.value !== 'United Kingdom';
  }

  get displayMentalHealthProfessional() {
    return (
      this.worker.mainJob.title === 'Social Worker' ||
      (this.worker.otherJobs && this.worker.otherJobs.find(j => j.title === 'Social Worker'))
    );
  }

  get otherJobRoles() {
    return this.worker.otherJobs.map(job => job.title).join(', ');
  }

  get mainStartDate() {
    return moment(this.worker.mainJobStartDate).format('DD/MM/YYYY');
  }

  get dob() {
    return moment(this.worker.dateOfBirth).format('DD/MM/YYYY');
  }

  get salary() {
    return `£${this.worker.annualHourlyPay.rate} ${this.worker.annualHourlyPay.value}`;
  }

  ngOnInit(): void {
    this.worker = this.route.parent.snapshot.data.worker;
  }

  goBack(event) {
    event.preventDefault();

    this.location.back();
  }

  saveAndComplete() {
    this.router.navigate(['/worker/save-success']);
  }
}
