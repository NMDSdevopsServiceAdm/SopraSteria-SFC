import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-adult-social-care-started',
  templateUrl: './adult-social-care-started.component.html',
})
export class AdultSocialCareStartedComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private subscriptions: Subscription = new Subscription();
  private worker: Worker;

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
      valueKnown: null,
      year: [null, this.yearValidator],
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.socialCareStartDate) {
        this.form.patchValue({
          valueKnown: this.worker.socialCareStartDate.value,
          year: this.worker.socialCareStartDate.year ? this.worker.socialCareStartDate.year : null,
        });
      }
    });

    this.subscriptions.add(
      this.form.controls.valueKnown.valueChanges.subscribe(() => {
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

      if ([Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract)) {
        this.router.navigate(['/worker', this.worker.uid, 'days-of-sickness']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'contract-with-zero-hours']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { valueKnown, year } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          ...(valueKnown.value && {
            socialCareStartDate: {
              value: valueKnown.value,
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
          this.messageService.show('error', `Year can't be in the future.`);
        } else if (year.errors.yearTooEarly) {
          this.messageService.show('error', `Year can't be earlier than 100 years ago.`);
        }

        reject();
      }
    });
  }

  yearValidator() {
    if (this.form) {
      const { valueKnown, year } = this.form.value;

      if (valueKnown === 'Yes') {
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
