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
  selector: 'app-weekly-contracted-hours',
  templateUrl: './weekly-contracted-hours.component.html',
})
export class WeeklyContractedHoursComponent implements OnInit, OnDestroy {
  public form: FormGroup;
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
      weeklyHoursContractedKnown: null,
      weeklyHoursContracted: [null, [Validators.min(0), Validators.max(65), this.hoursRequiredValidator]],
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (
        this.worker.zeroHoursContract === 'Yes' ||
        [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
      ) {
        this.router.navigate(['/worker', this.worker.uid, 'average-weekly-hours'], { replaceUrl: true });
      }

      if (this.worker.weeklyHoursContracted) {
        this.form.patchValue({
          weeklyHoursContractedKnown: this.worker.weeklyHoursContracted.value,
          weeklyHoursContracted: this.worker.weeklyHoursContracted.hours,
        });
      }

      this.subscriptions.add(
        this.form.controls.weeklyHoursContractedKnown.valueChanges.subscribe(() => {
          this.form.controls.weeklyHoursContracted.reset();
          this.form.controls.weeklyHoursContracted.updateValueAndValidity();
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
      const { weeklyHoursContractedKnown, weeklyHoursContracted } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          ...(weeklyHoursContractedKnown.value && {
            weeklyHoursContracted: {
              value: weeklyHoursContractedKnown.value,
              ...(weeklyHoursContracted.value && {
                hours: weeklyHoursContracted.value,
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
        if (weeklyHoursContracted.errors.required) {
          this.messageService.show('error', 'Contracted weekly hours is required');
        }
        if (weeklyHoursContracted.errors.min || weeklyHoursContracted.errors.max) {
          this.messageService.show('error', 'Contracted weekly hours must be between 0 and 65.');
        }

        reject();
      }
    });
  }

  hoursRequiredValidator() {
    if (this.form) {
      const { weeklyHoursContractedKnown, weeklyHoursContracted } = this.form.value;

      if (weeklyHoursContractedKnown === 'Yes' && isNull(weeklyHoursContracted)) {
        return { required: true };
      }
    }

    return null;
  }
}
