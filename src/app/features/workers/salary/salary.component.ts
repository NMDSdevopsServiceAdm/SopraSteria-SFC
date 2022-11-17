import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { INT_PATTERN, SALARY_PATTERN } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
  public salaryPattern = SALARY_PATTERN.toString();
  public section = 'Employment details';
  private careCertificatePath: string[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private decimalPipe: DecimalPipe,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);
    this.salaryPattern = this.salaryPattern.substring(1, this.salaryPattern.length - 1);

    this.form = this.formBuilder.group({
      terms: null,
      hourlyRate: null,
      annualRate: null,
    });
  }

  init() {
    this.setValidators();
    this.setAnnualHourlyPay();
    this.next = this.getRoutePath('care-certificate');
  }

  private setValidators(): void {
    this.subscriptions.add(
      this.form.get('terms').valueChanges.subscribe((value) => {
        const { annualRate, hourlyRate } = this.form.controls;
        annualRate.clearValidators();
        hourlyRate.clearValidators();

        if (value === 'Hourly') {
          hourlyRate.setValidators([
            Validators.required,
            Validators.min(this.hourly.min),
            Validators.max(this.hourly.max),
            Validators.pattern(this.salaryPattern),
          ]);
        } else if (value === 'Annually') {
          annualRate.setValidators([
            Validators.required,
            Validators.min(this.annually.min),
            Validators.max(this.annually.max),
            Validators.pattern(this.intPattern),
          ]);
        }

        annualRate.updateValueAndValidity();
        hourlyRate.updateValueAndValidity();
      }),
    );
  }

  private setAnnualHourlyPay(): void {
    if (this.worker.annualHourlyPay) {
      this.form.patchValue({
        terms: this.worker.annualHourlyPay.value,
        hourlyRate: this.worker.annualHourlyPay.value === 'Hourly' ? this.worker.annualHourlyPay.rate.toFixed(2) : null,
        annualRate:
          this.worker.annualHourlyPay.value === 'Annually' ? this.worker.annualHourlyPay.rate.toFixed(0) : null,
      });
    }
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'annualRate',
        type: [
          {
            name: 'required',
            message: 'Enter their standard annual salary',
          },
          {
            name: 'pattern',
            message: 'Standard annual salary must not include pence',
          },
          {
            name: 'min',
            message: `Standard annual salary must be between &pound;${this.decimalPipe.transform(
              this.annually.min,
              '1.0-0',
            )} and &pound;${this.decimalPipe.transform(this.annually.max, '1.0-0')}`,
          },
          {
            name: 'max',
            message: `Standard annual salary must be between &pound;${this.decimalPipe.transform(
              this.annually.min,
              '1.0-0',
            )} and &pound;${this.decimalPipe.transform(this.annually.max, '1.0-0')}`,
          },
        ],
      },
      {
        item: 'hourlyRate',
        type: [
          {
            name: 'required',
            message: 'Enter their standard hourly salary',
          },
          {
            name: 'pattern',
            message: 'Standard hourly rate can only have 1 or 2 digits after the decimal point when you include pence',
          },
          {
            name: 'min',
            message: `Standard hourly rate must be between &pound;${this.decimalPipe.transform(
              this.hourly.min,
              '1.2-2',
            )} and &pound;${this.decimalPipe.transform(this.hourly.max, '1.2-2')}`,
          },
          {
            name: 'max',
            message: `Standard hourly salary must be between &pound;${this.decimalPipe.transform(
              this.hourly.min,
              '1.2-2',
            )} and &pound;${this.decimalPipe.transform(this.hourly.max, '1.2-2')}`,
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
        rate,
      },
    };
  }
}
