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
  selector: 'app-days-of-sickness',
  templateUrl: './days-of-sickness.component.html',
})
export class DaysOfSicknessComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public backLink: string;
  public daysSicknessMin = 0;
  public daysSicknessMax = 366;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.valueValidator = this.valueValidator.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      valueKnown: null,
      value: [null, [Validators.min(this.daysSicknessMin), Validators.max(this.daysSicknessMax), this.valueValidator]],
    });

    if (this.workerService.returnToSummary) {
      this.backLink = 'summary';
    } else {
      this.backLink = 'adult-social-care-started';
    }

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (![Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract)) {
        this.router.navigate(['/worker', this.worker.uid, 'adult-social-care-started'], { replaceUrl: true });
      }

      if (this.worker.daysSick) {
        this.form.patchValue({
          valueKnown: this.worker.daysSick.value,
          value: !isNull(this.worker.daysSick.days) ? this.worker.daysSick.days : null,
        });
      }
    });

    this.subscriptions.add(
      this.form.controls.valueKnown.valueChanges.subscribe(() => {
        this.form.controls.value.reset();
        this.form.controls.value.updateValueAndValidity();
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
      this.router.navigate(['/worker', this.worker.uid, 'contract-with-zero-hours']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { valueKnown, value } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          ...(valueKnown.value && {
            daysSick: {
              value: valueKnown.value,
              days: value.value,
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
        if (value.errors.required) {
          this.messageService.show('error', `'Number of days' is required.`);
        }

        if (value.errors.min || value.errors.max) {
          this.messageService.show(
            'error',
            `Number of days must be between ${this.daysSicknessMin} and ${this.daysSicknessMax}.`
          );
        }

        reject();
      }
    });
  }

  valueValidator() {
    if (this.form) {
      const { valueKnown } = this.form.value;
      const value = this.form.controls.value.value;

      if (valueKnown === 'Yes' && isNull(value)) {
        return { required: true };
      }
    }

    return null;
  }
}
