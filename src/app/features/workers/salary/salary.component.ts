import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  providers: [DecimalPipe],
})
export class SalaryComponent implements OnInit, OnDestroy {
  public backLink: string;
  public form: FormGroup;
  public hourly = { min: 2.5, max: 200 };
  public annually = { min: 500, max: 200000 };
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private decimalPipe: DecimalPipe
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      terms: null,
      rate: null,
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.workerService.returnToSummary) {
        this.backLink = 'summary';
      } else {
        this.backLink =
          this.worker.zeroHoursContract === 'Yes' ||
          [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
            ? 'average-weekly-hours'
            : 'weekly-contracted-hours';
      }

      if (this.worker.annualHourlyPay) {
        this.form.patchValue({
          terms: this.worker.annualHourlyPay.value,
          rate:
            this.worker.annualHourlyPay.value === 'Annually'
              ? this.worker.annualHourlyPay.rate.toFixed(0)
              : this.worker.annualHourlyPay.rate.toFixed(2),
        });
      }
    });

    this.subscriptions.add(
      this.form.controls.terms.valueChanges.subscribe(val => {
        const rate = this.form.controls.rate;
        rate.clearValidators();
        rate.reset();

        if (val === 'Hourly') {
          rate.setValidators([Validators.min(this.hourly.min), Validators.max(this.hourly.max), Validators.required]);
        } else if (val === 'Annually') {
          rate.setValidators([
            Validators.min(this.annually.min),
            Validators.max(this.annually.max),
            Validators.required,
          ]);
        }

        rate.updateValueAndValidity();
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

      this.router.navigate(['/worker', this.worker.uid, 'care-certificate']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { terms, rate } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        worker.annualHourlyPay = terms.value ? { value: terms.value, rate: rate.value } : null;

        const props = {
          annualHourlyPay: terms.value
            ? {
                value: terms.value,
                rate: rate.value,
              }
            : null,
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (terms.value === 'Hourly' && rate.errors) {
          this.messageService.show(
            'error',
            `Hourly rate must be between £${this.decimalPipe.transform(
              this.hourly.min,
              '1.2-2'
            )} and £${this.decimalPipe.transform(this.hourly.max, '1.2-2')}.`
          );
        }

        if (terms.value === 'Annually' && rate.errors) {
          this.messageService.show(
            'error',
            `Annual salary must be between £${this.decimalPipe.transform(
              this.annually.min,
              '1.0-0'
            )} and £${this.decimalPipe.transform(this.annually.max, '1.0-0')}.`
          );
        }

        reject();
      }
    });
  }
}
