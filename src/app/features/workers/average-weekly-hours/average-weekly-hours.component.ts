import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FLOAT_PATTERN } from '@core/constants/constants';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import isNull from 'lodash/isNull';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-average-weekly-hours',
  templateUrl: './average-weekly-hours.component.html',
})
export class AverageWeeklyHoursComponent extends QuestionComponent {
  public floatPattern = FLOAT_PATTERN.toString();
  public contractedMaxHours = 75;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.floatPattern = this.floatPattern.substring(1, this.floatPattern.length - 1);

    this.form = this.formBuilder.group({
      hoursKnown: null,
      hours: null,
    });
  }

  init(): void {
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

    if (this.worker.weeklyHoursAverage) {
      this.form.patchValue({
        hoursKnown: this.worker.weeklyHoursAverage.value,
        hours: !isNull(this.worker.weeklyHoursAverage.hours) ? this.worker.weeklyHoursAverage.hours : null,
      });
    }

    this.next = this.getRoutePath('salary');
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'hours',
        type: [
          {
            name: 'required',
            message: 'Enter the average weekly hours',
          },
          {
            name: 'min',
            message: `Average weekly hours must be between 0 and ${this.contractedMaxHours}`,
          },
          {
            name: 'max',
            message: `Average weekly hours must be between 0 and ${this.contractedMaxHours}`,
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
        ...(hoursKnown === 'Yes' && {
          hours,
        }),
      },
    };
  }
}
