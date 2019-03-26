import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DEFAULT_DATE_DISPLAY_FORMAT, DEFAULT_DATE_FORMAT } from '@core/constants/constants';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@core/validators/date.validator';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-date-of-birth',
  templateUrl: './date-of-birth.component.html',
})
export class DateOfBirthComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public backLink: string;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.formValidator = this.formValidator.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      day: null,
      month: null,
      year: null,
    });
    this.form.setValidators(Validators.compose([this.form.validator, DateValidator.dateValid(), this.formValidator]));

    if (this.workerService.returnToSummary) {
      this.backLink = 'summary';
    } else {
      this.backLink = 'national-insurance-number';
    }

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.dateOfBirth) {
        const date = moment(this.worker.dateOfBirth, DEFAULT_DATE_FORMAT);
        this.form.patchValue({
          year: date.year(),
          month: date.month() + 1,
          day: date.date(),
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();
      this.router.navigate(['/worker', this.worker.uid, 'home-postcode']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { day, month, year } = this.form.value;
      this.messageService.clearError();

      if (this.form.valid) {
        const date =
          day && month && year
            ? moment()
                .year(year)
                .month(month - 1)
                .date(day)
            : null;
        const props = {
          dateOfBirth: date ? date.format(DEFAULT_DATE_FORMAT) : null,
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (this.form.errors) {
          if (this.form.errors.required) {
            this.messageService.show('error', 'Please fill required fields.');
          } else if (this.form.errors.dateBetween) {
            const noBefore = this.calculateLowestAcceptableDate();
            const noAfter = this.calculateHighestAcceptableDate();
            this.messageService.show(
              'error',
              `The date has to be between ${noBefore.format(DEFAULT_DATE_DISPLAY_FORMAT)} and ${noAfter.format(
                DEFAULT_DATE_DISPLAY_FORMAT
              )}.`
            );

            // TODO: https://trello.com/c/sYDV6vTN
            // Cross Validation
          } else if (this.form.errors.dateValid) {
            this.messageService.show('error', 'Invalid date.');
          }
        }

        reject();
      }
    });
  }

  private calculateLowestAcceptableDate() {
    return moment()
      .subtract(100, 'years')
      .add(1, 'days');
  }

  private calculateHighestAcceptableDate() {
    return moment().subtract(14, 'years');
  }

  formValidator(formGroup: FormGroup): ValidationErrors {
    if (this.form) {
      const { day, month, year } = this.form.value;

      if (day && month && year) {
        const date = moment()
          .year(year)
          .month(month - 1)
          .date(day);
        if (date.isValid()) {
          // TODO: https://trello.com/c/sYDV6vTN
          // Cross Validation
          const noBefore = this.calculateLowestAcceptableDate();
          const noAfter = this.calculateHighestAcceptableDate();
          return date.isBetween(noBefore, noAfter, 'd', '[]') ? null : { dateBetween: true };
        }
      }
    }

    return null;
  }
}
