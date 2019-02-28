import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_DATE_FORMAT } from '@core/constants/constants';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@core/validators/date.validator';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-job-start-date',
  templateUrl: './main-job-start-date.component.html',
})
export class MainJobStartDateComponent implements OnInit, OnDestroy {
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.validateCross = this.validateCross.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    this.backLink = this.worker.mainJob.title === 'Social Worker' ? 'mental-health' : 'staff-details';

    this.form = this.formBuilder.group({
      day: null,
      month: null,
      year: null,
    });

    this.form.setValidators(
      Validators.compose([this.form.validator, DateValidator.datePastOrToday(), this.validateCross])
    );

    if (this.worker.mainJobStartDate) {
      const date = this.worker.mainJobStartDate.split('-');
      this.form.patchValue({
        year: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        day: parseInt(date[2], 10),
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();
      this.router.navigate(['/worker', this.worker.uid, 'other-job-roles']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      this.messageService.clearError();

      if (this.form.valid) {
        const newDate: any = this.dateFromForm();
        this.worker.mainJobStartDate = newDate ? newDate.format(DEFAULT_DATE_FORMAT) : null;
        this.subscriptions.add(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        if (this.form.errors) {
          if (this.form.errors.required) {
            this.messageService.show('error', 'Please fill required fields.');
          } else if (this.form.errors.dateValid) {
            this.messageService.show('error', 'Invalid date.');

            // TODO cross validation
            // } else if (this.form.errors.dateAgainstDob) {
            //   this.messageService.show("error", "The date can't be too near the Date Of Birth.")
          } else if (this.form.errors.dateInPast) {
            this.messageService.show('error', `The date can't be in the future.`);
          }
        }

        reject();
      }
    });
  }

  dateFromForm() {
    const { day, month, year } = this.form.value;
    const date = moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT);
    return date.isValid() ? date : null;
  }

  validateCross() {
    if (this.form && this.worker.dateOfBirth) {
      // TODO cross validation against DOB and year-of-arrival
      //   const jobStartDate = this.dateFromForm()
      //   const validDateToStartWork =
      //     moment(this.worker.dateOfBirth, DEFAULT_DATE_FORMAT).add(14, "y")
      //   if (jobStartDate.isBefore(validDateToStartWork)) {
      //     return { dateAgainstDob: true }
      //   }
    }

    return null;
  }
}
