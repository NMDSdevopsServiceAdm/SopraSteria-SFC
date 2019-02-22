import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-worker-summary',
  templateUrl: './worker-summary.component.html',
  styleUrls: ['./worker-summary.component.scss'],
})
export class WorkerSummaryComponent implements OnInit, OnDestroy {
  private worker: Worker;
  private workerId: string;
  private subscriptions = [];

  constructor(private _location: Location, private workerService: WorkerService) {}

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

  get otherJobRoles() {
    return this.worker.otherJobs.map(job => job.title).join(', ');
  }

  get salary() {
    return `£${this.worker.annualHourlyPay.rate} ${this.worker.annualHourlyPay.value}`;
  }

  ngOnInit(): void {
    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goBack(event) {
    event.preventDefault();

    this._location.back();
  }
}
