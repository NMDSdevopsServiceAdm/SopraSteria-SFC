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
  selector: 'app-days-of-sickness',
  templateUrl: './days-of-sickness.component.html',
})
export class DaysOfSicknessComponent extends QuestionComponent {
  public daysSicknessMin = 0;
  public daysSicknessMax = 365;
  public floatPattern = FLOAT_PATTERN.toString();

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

    this.form = this.formBuilder.group({
      daysKnown: null,
      days: null,
    });

    this.floatPattern = this.floatPattern.substring(1, this.floatPattern.length - 1);
  }

  init() {
    this.subscriptions.add(
      this.form.get('daysKnown').valueChanges.subscribe((value) => {
        this.form.get('days').clearValidators();

        if (value === 'Yes') {
          this.form
            .get('days')
            .setValidators([
              Validators.required,
              Validators.min(this.daysSicknessMin),
              Validators.max(this.daysSicknessMax),
            ]);
        }

        this.form.get('days').updateValueAndValidity();
      }),
    );

    if (this.worker.daysSick) {
      this.form.patchValue({
        daysKnown: this.worker.daysSick.value,
        days: !isNull(this.worker.daysSick.days) ? this.worker.daysSick.days : null,
      });
    }

    this.next = this.getRoutePath('contract-with-zero-hours');
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'days',
        type: [
          {
            name: 'required',
            message: 'Enter the number of days',
          },
          {
            name: 'min',
            message: `Number of days must be between ${this.daysSicknessMin} and ${this.daysSicknessMax}`,
          },
          {
            name: 'max',
            message: `Number of days must be between ${this.daysSicknessMin} and ${this.daysSicknessMax}`,
          },
          {
            name: 'pattern',
            message: 'Number of days is invalid',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { daysKnown, days } = this.form.value;

    if (!daysKnown) {
      return null;
    }

    return {
      daysSick: {
        value: daysKnown,
        days,
      },
    };
  }
}
