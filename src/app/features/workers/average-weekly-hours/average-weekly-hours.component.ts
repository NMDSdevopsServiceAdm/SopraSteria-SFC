import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { isNull } from 'util';

@Component({
  selector: 'app-average-weekly-hours',
  templateUrl: './average-weekly-hours.component.html',
})
export class AverageWeeklyHoursComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public backLink: string;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.hoursRequiredValidator = this.hoursRequiredValidator.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      weeklyHoursAverageKnown: null,
      weeklyHoursAverage: [null, [Validators.min(0), Validators.max(65), this.hoursRequiredValidator]],
    });

    if (this.workerService.returnTo) {
      this.backLink = 'summary';
    } else {
      this.backLink = 'contract-with-zero-hours';
    }

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (
        !(
          this.worker.zeroHoursContract === 'Yes' ||
          [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
        )
      ) {
        this.router.navigate(['/worker', this.worker.uid, 'weekly-contracted-hours'], { replaceUrl: true });
      }

      if (this.worker.weeklyHoursAverage) {
        this.form.patchValue({
          weeklyHoursAverageKnown: this.worker.weeklyHoursAverage.value,
          weeklyHoursAverage: !isNull(this.worker.weeklyHoursAverage.hours)
            ? this.worker.weeklyHoursAverage.hours
            : null,
        });
      }

      this.subscriptions.add(
        this.form.controls.weeklyHoursAverageKnown.valueChanges.subscribe(() => {
          this.form.controls.weeklyHoursAverage.reset();
          this.form.controls.weeklyHoursAverage.updateValueAndValidity();
        })
      );
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker', this.worker.uid, 'salary']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { weeklyHoursAverageKnown, weeklyHoursAverage } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          ...(weeklyHoursAverageKnown.value && {
            weeklyHoursAverage: {
              value: weeklyHoursAverageKnown.value,
              ...(weeklyHoursAverage.value && {
                hours: weeklyHoursAverage.value,
              }),
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
        if (weeklyHoursAverage.errors.required) {
          this.messageService.show('error', 'Average weekly hours is required');
        }
        if (weeklyHoursAverage.errors.min || weeklyHoursAverage.errors.max) {
          this.messageService.show('error', 'Average weekly hours must be between 0 and 65.');
        }

        reject();
      }
    });
  }

  hoursRequiredValidator() {
    if (this.form) {
      const { weeklyHoursAverageKnown, weeklyHoursAverage } = this.form.value;

      if (weeklyHoursAverageKnown === 'Yes' && isNull(weeklyHoursAverage)) {
        return { required: true };
      }
    }

    return null;
  }
}
