import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-weekly-contracted-hours',
  templateUrl: './weekly-contracted-hours.component.html',
})
export class WeeklyContractedHoursComponent extends QuestionComponent {
  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

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
      this.router.navigate(['/worker', this.worker.uid, 'average-weekly-hours'], { replaceUrl: true });
    }

    this.subscriptions.add(
      this.form.get('hoursKnown').valueChanges.subscribe(value => {
        this.form.get('hours').reset();
        this.form.get('hours').clearValidators();

        if (value === 'Yes') {
          this.form.get('hours').setValidators([Validators.required, Validators.min(0), Validators.max(65)]);
        }

        this.form.get('hours').updateValueAndValidity();
      })
    );

    if (this.worker.weeklyHoursContracted) {
      this.form.patchValue({
        hoursKnown: this.worker.weeklyHoursContracted.value,
        hours: this.worker.weeklyHoursContracted.hours,
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
            message: 'Contracted weekly hours is required.',
          },
          {
            name: 'min',
            message: 'Contracted weekly hours must be between 0 and 65.',
          },
          {
            name: 'max',
            message: 'Contracted weekly hours must be between 0 and 65.',
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
        ...(hours && {
          hours: hours,
        }),
      },
    };
  }
}
