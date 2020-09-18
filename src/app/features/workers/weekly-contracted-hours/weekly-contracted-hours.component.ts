import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FLOAT_PATTERN } from '@core/constants/constants';
import { Contracts } from '@core/model/contracts.enum';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-weekly-contracted-hours',
  templateUrl: './weekly-contracted-hours.component.html',
})
export class WeeklyContractedHoursComponent extends QuestionComponent {
  public floatPattern = FLOAT_PATTERN.toString();
  public contractedMaxHours = 75;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.floatPattern = this.floatPattern.substring(1, this.floatPattern.length - 1);

    this.form = this.formBuilder.group({
      hoursKnown: null,
      hours: null,
    });
  }

  init() {
    if (
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
    ) {
      this.router.navigate(this.getRoutePath('average-weekly-hours'), { replaceUrl: true });
    }

    this.subscriptions.add(
      this.form.get('hoursKnown').valueChanges.subscribe((value) => {
        this.form.get('hours').clearValidators();

        if (value === 'Yes') {
          this.form
            .get('hours')
            .setValidators([Validators.required, Validators.min(0), Validators.max(this.contractedMaxHours)]);
        }

        this.form.get('hours').updateValueAndValidity();
      }),
    );

    if (this.worker.weeklyHoursContracted) {
      this.form.patchValue({
        hoursKnown: this.worker.weeklyHoursContracted.value,
        hours: this.worker.weeklyHoursContracted.hours,
      });
    }

    this.next = this.getRoutePath('salary');
    this.previous = this.getRoutePath('contract-with-zero-hours');
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'hours',
        type: [
          {
            name: 'required',
            message: 'Contracted weekly hours is required.',
          },
          {
            name: 'min',
            message: `Contracted weekly hours must be between 0 and ${this.contractedMaxHours}.`,
          },
          {
            name: 'max',
            message: `Contracted weekly hours must be between 0 and ${this.contractedMaxHours}.`,
          },
          {
            name: 'pattern',
            message: 'Contracted weekly hours must contain only numbers.',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { hoursKnown, hours } = this.form.value;

    if (!hoursKnown) {
      return null;
    }

    return {
      weeklyHoursContracted: {
        value: hoursKnown,
        ...(hoursKnown === 'Yes' && {
          hours,
        }),
      },
    };
  }
}
