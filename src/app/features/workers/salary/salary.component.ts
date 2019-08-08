import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FLOAT_PATTERN, INT_PATTERN } from '@core/constants/constants';
import { Contracts } from '@core/model/contracts.enum';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  providers: [DecimalPipe],
})
export class SalaryComponent extends QuestionComponent {
  public hourly = { min: 2.5, max: 200 };
  public annually = { min: 500, max: 200000 };
  public intPattern = INT_PATTERN.toString();
  public floatPattern = FLOAT_PATTERN.toString();

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    private decimalPipe: DecimalPipe
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);
    this.floatPattern = this.floatPattern.substring(1, this.floatPattern.length - 1);

    this.form = this.formBuilder.group({
      terms: null,
      hourlyRate: null,
      annualRate: null,
    });
  }

  init() {
    this.subscriptions.add(
      this.form.get('terms').valueChanges.subscribe(value => {
        const { annualRate, hourlyRate } = this.form.controls;
        annualRate.clearValidators();
        hourlyRate.clearValidators();

        if (value === 'Hourly') {
          hourlyRate.setValidators([
            Validators.required,
            Validators.min(this.hourly.min),
            Validators.max(this.hourly.max),
          ]);
        } else if (value === 'Annually') {
          annualRate.setValidators([
            Validators.required,
            Validators.min(this.annually.min),
            Validators.max(this.annually.max),
          ]);
        }

        annualRate.updateValueAndValidity();
        hourlyRate.updateValueAndValidity();
      })
    );

    if (this.worker.annualHourlyPay) {
      this.form.patchValue({
        terms: this.worker.annualHourlyPay.value,
        hourlyRate: this.worker.annualHourlyPay.value === 'Hourly' ? this.worker.annualHourlyPay.rate.toFixed(2) : null,
        annualRate:
          this.worker.annualHourlyPay.value === 'Annually' ? this.worker.annualHourlyPay.rate.toFixed(0) : null,
      });
    }

    this.next = this.getRoutePath('care-certificate');
    this.previous =
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
        ? this.getRoutePath('average-weekly-hours')
        : this.getRoutePath('weekly-contracted-hours');
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'annualRate',
        type: [
          {
            name: 'required',
            message: 'Annual salary is required.',
          },
          {
            name: 'min',
            message: `Annual salary must be between &pound;${this.decimalPipe.transform(
              this.annually.min,
              '1.0-0'
            )} and &pound;${this.decimalPipe.transform(this.annually.max, '1.0-0')}.`,
          },
          {
            name: 'max',
            message: `Annual salary must be between &pound;${this.decimalPipe.transform(
              this.annually.min,
              '1.0-0'
            )} and &pound;${this.decimalPipe.transform(this.annually.max, '1.0-0')}.`,
          },
        ],
      },
      {
        item: 'hourlyRate',
        type: [
          {
            name: 'required',
            message: 'Hourly rate is required.',
          },
          {
            name: 'min',
            message: `Hourly rate must be between &pound;${this.decimalPipe.transform(
              this.hourly.min,
              '1.2-2'
            )} and &pound;${this.decimalPipe.transform(this.hourly.max, '1.2-2')}.`,
          },
          {
            name: 'max',
            message: `Hourly rate must be between &pound;${this.decimalPipe.transform(
              this.hourly.min,
              '1.2-2'
            )} and &pound;${this.decimalPipe.transform(this.hourly.max, '1.2-2')}.`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { terms, annualRate, hourlyRate } = this.form.value;

    if (!terms) {
      return null;
    }

    const rate = terms === 'Annually' ? annualRate : terms === 'Hourly' ? hourlyRate : null;

    return {
      annualHourlyPay: {
        value: terms,
        rate: rate,
      },
    };
  }
}
