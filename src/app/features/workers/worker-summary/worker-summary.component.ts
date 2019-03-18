import { DecimalPipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@core/constants/constants';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { DialogService } from '@core/services/dialog.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { DeleteWorkerDialogComponent } from '../delete-worker-dialog/delete-worker-dialog.component';

@Component({
  selector: 'app-worker-summary',
  templateUrl: './worker-summary.component.html',
  styleUrls: ['./worker-summary.component.scss'],
  providers: [DecimalPipe],
})
export class WorkerSummaryComponent implements OnInit, OnDestroy {
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private location: Location,
    private router: Router,
    private decimalPipe: DecimalPipe,
    private workerService: WorkerService,
    private dialogService: DialogService
  ) {}

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

  get displayDaysSickness() {
    return [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract);
  }

  get displayBritishCitizenship() {
    return !(this.worker.nationality && this.worker.nationality.value === 'British');
  }

  get mainStartDate() {
    return moment(this.worker.mainJobStartDate).format(DEFAULT_DATE_DISPLAY_FORMAT);
  }

  get dob() {
    return moment(this.worker.dateOfBirth).format(DEFAULT_DATE_DISPLAY_FORMAT);
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

  ngOnInit(): void {
    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  goBack(event) {
    event.preventDefault();

    this.location.back();
  }

  deleteWorker(event) {
    event.preventDefault();
    const dialog = this.dialogService.open(DeleteWorkerDialogComponent, this.worker);
    dialog.afterClosed.pipe(take(1)).subscribe(nameOrId => {
      if (nameOrId) {
        this.workerService.setLastDeleted(nameOrId);
        this.router.navigate(['/worker', 'delete-success']);
      }
    });
  }

  async saveAndComplete() {
    try {
      await this.setWorkerCompleted();

      this.router.navigate(['/worker/save-success']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  setWorkerCompleted(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const props = {
        completed: true,
      };

      this.subscriptions.add(
        this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
          this.workerService.setState({ ...this.worker, ...data });
          resolve();
        }, reject)
      );
    });
  }
}
