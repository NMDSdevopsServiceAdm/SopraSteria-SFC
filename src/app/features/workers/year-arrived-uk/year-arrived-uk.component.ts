import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-year-arrived-uk',
  templateUrl: './year-arrived-uk.component.html',
})
export class YearArrivedUkComponent implements OnInit, OnDestroy {
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
    this.yearValidator = this.yearValidator.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      yearKnown: null,
      year: [null, this.yearValidator],
    });

    if (this.workerService.returnTo) {
      this.backLink = 'summary';
    } else {
      this.backLink = 'country-of-birth';
    }

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.yearArrived) {
        this.form.patchValue({
          yearKnown: this.worker.yearArrived.value,
          year: this.worker.yearArrived.year ? this.worker.yearArrived.year : null,
        });
      }
    });

    this.subscriptions.add(
      this.form.controls.yearKnown.valueChanges.subscribe(() => {
        this.messageService.clearAll();
        this.form.controls.year.reset();
        this.form.controls.year.updateValueAndValidity();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();
      this.router.navigate(['/worker', this.worker.uid, 'recruited-from']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { yearKnown, year } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          ...(yearKnown.value && {
            yearArrived: {
              value: yearKnown.value,
              year: year.value,
            },
          }),
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (year.errors.required) {
          this.messageService.show('error', 'Year is required.');
        } else if (year.errors.yearDigits) {
          this.messageService.show('error', 'Year must have 4 digits.');
        } else if (year.errors.yearInFuture) {
          this.messageService.show('error', `Year can't be in future.`);
        } else if (year.errors.yearTooEarly) {
          this.messageService.show('error', `Year can't be earlier than 100 years ago.`);
        }

        reject();
      }
    });
  }

  // TODO: https://trello.com/c/sYDV6vTN
  // Cross Validation
  yearValidator() {
    if (this.form) {
      const { yearKnown, year } = this.form.value;

      if (yearKnown === 'Yes') {
        if (year) {
          const currentYear = moment().year();

          if (currentYear - year < 0) {
            return { yearInFuture: true };
          } else if (currentYear - year > 100) {
            return { yearTooEarly: true };
          }

          return year.toString().length < 4 ? { yearDigits: true } : null;
        } else {
          return { required: true };
        }
      }
    }

    return null;
  }
}
