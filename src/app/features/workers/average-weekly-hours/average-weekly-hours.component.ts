import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FLOAT_PATTERN } from '@core/constants/constants';
import { Contracts } from '@core/constants/contracts.enum';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { isNull } from 'util';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-average-weekly-hours',
  templateUrl: './average-weekly-hours.component.html',
})
export class AverageWeeklyHoursComponent extends QuestionComponent {
  public floatPattern = FLOAT_PATTERN.toString();

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.floatPattern = this.floatPattern.substring(1, this.floatPattern.length - 1);

    this.form = this.formBuilder.group({
      hoursKnown: null,
      hours: null,
    });
  }

  init(): void {
    if (
      !(
        this.worker.zeroHoursContract === 'Yes' ||
        [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
      )
    ) {
      this.router.navigate(['/worker', this.worker.uid, 'weekly-contracted-hours'], { replaceUrl: true });
    }

    this.subscriptions.add(
      this.form.get('hoursKnown').valueChanges.subscribe(value => {
        this.form.get('hours').clearValidators();

        if (value === 'Yes') {
          this.form.get('hours').setValidators([Validators.required, Validators.min(0), Validators.max(65)]);
        }

        this.form.get('hours').updateValueAndValidity();
      })
    );

    if (this.worker.weeklyHoursAverage) {
      this.form.patchValue({
        hoursKnown: this.worker.weeklyHoursAverage.value,
        hours: !isNull(this.worker.weeklyHoursAverage.hours) ? this.worker.weeklyHoursAverage.hours : null,
      });
    }

    this.next = ['/worker', this.worker.uid, 'salary'];
    this.previous = ['/worker', this.worker.uid, 'contract-with-zero-hours'];
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'hours',
        type: [
          {
            name: 'required',
            message: 'Average weekly hours is required.',
          },
          {
            name: 'min',
            message: 'Average weekly hours must be between 0 and 65.',
          },
          {
            name: 'max',
            message: 'Average weekly hours must be between 0 and 65.',
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
      weeklyHoursAverage: {
        value: hoursKnown,
        ...(hours && {
          hours: hours,
        }),
      },
    };
  }
}
