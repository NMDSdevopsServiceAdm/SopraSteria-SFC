import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AnnualSalaryLimits,
  AnnualSalaryLimitsForSeniorManagement,
  HourlyPayRateLimits,
  INT_PATTERN,
  SALARY_PATTERN,
  SeniorManagementJobId,
} from '@core/constants/constants';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  providers: [DecimalPipe],
  standalone: false,
})
export class SalaryComponent extends QuestionComponent {
  public hourly = HourlyPayRateLimits;
  public annually: any;
  public section = 'Employment details';
  public isAdmin = false;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private decimalPipe: DecimalPipe,
    private authService: AuthService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      terms: null,
      hourlyRate: null,
      annualRate: null,
    });
  }

  init() {
    this.annually =
      this.worker.mainJob.jobId === SeniorManagementJobId ? AnnualSalaryLimitsForSeniorManagement : AnnualSalaryLimits;

    this.isAdmin = this.authService.isAdmin;
    if (this.isAdmin) {
      this.hourly = { min: 0, max: 99999.99, asString: { min: '£0.00', max: '£99999.99' } };
      this.annually = { min: 0, max: 9999999, asString: { min: '£0.00', max: '£9999999' } };
    }

    this.setValidators();
    this.setAnnualHourlyPay();
    this.next = this.getRoutePath('care-certificate');
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
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
            Validators.pattern(SALARY_PATTERN),
          ]);
        } else if (value === 'Annually') {
          annualRate.setValidators([
            Validators.required,
            Validators.min(this.annually.min),
            Validators.max(this.annually.max),
            Validators.pattern(INT_PATTERN),
          ]);
        }

        annualRate.updateValueAndValidity();
        hourlyRate.updateValueAndValidity();
      }),
    );

    this.subscriptions.add(
      this.form.get('terms').valueChanges.subscribe(() => {
        this.submitted = false;
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
            message: `Standard annual salary must be between £${this.decimalPipe.transform(
              this.annually.min,
              '1.0-0',
            )} and £${this.decimalPipe.transform(this.annually.max, '1.0-0')}`,
          },
          {
            name: 'max',
            message: `Standard annual salary must be between £${this.decimalPipe.transform(
              this.annually.min,
              '1.0-0',
            )} and £${this.decimalPipe.transform(this.annually.max, '1.0-0')}`,
          },
        ],
      },
      {
        item: 'hourlyRate',
        type: [
          {
            name: 'required',
            message: 'Enter their standard hourly rate',
          },
          {
            name: 'pattern',
            message: 'Standard hourly rate can only have 1 or 2 digits after the decimal point when you include pence',
          },
          {
            name: 'min',
            message: `Standard hourly rate must be between £${this.decimalPipe.transform(
              this.hourly.min,
              '1.2-2',
            )} and £${this.decimalPipe.transform(this.hourly.max, '1.2-2')}`,
          },
          {
            name: 'max',
            message: `Standard hourly rate must be between £${this.decimalPipe.transform(
              this.hourly.min,
              '1.2-2',
            )} and £${this.decimalPipe.transform(this.hourly.max, '1.2-2')}`,
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

  _updateWorker(workerUid: string, props: Record<string, any>) {
    if (this.isAdmin) {
      this._updateWorkerAsAdmin(workerUid, props);
      return;
    } else {
      super._updateWorker(workerUid, props);
    }
  }

  _updateWorkerAsAdmin(workerUid: string, props: Record<string, any>) {
    this.subscriptions.add(
      this.workerService.updateWorkerAsAdmin(this.workplace.uid, workerUid, props).subscribe({
        next: (data) => this._onSuccess(data),
        error: (error) => this.onError(error),
      }),
    );
  }

  protected addErrorLinkFunctionality(): void {
    if (!this.errorSummaryService.formEl$.value) {
      this.errorSummaryService.formEl$.next(this.formEl);
    }
  }
}
