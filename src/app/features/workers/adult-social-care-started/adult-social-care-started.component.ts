import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { INT_PATTERN } from '@core/constants/constants';
import { Contracts } from '@core/model/contracts.enum';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-adult-social-care-started',
  templateUrl: './adult-social-care-started.component.html',
})
export class AdultSocialCareStartedComponent extends QuestionComponent {
  public intPattern = INT_PATTERN.toString();

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);

    this.form = this.formBuilder.group({
      yearKnown: null,
      year: null,
    });
  }

  init(): void {
    this.subscriptions.add(
      this.form.get('yearKnown').valueChanges.subscribe(value => {
        this.form.get('year').clearValidators();

        if (value === 'Yes') {
          this.form.get('year').setValidators([
            Validators.required,
            Validators.min(
              moment()
                .subtract(100, 'years')
                .year()
            ),
            Validators.max(moment().year()),
          ]);
        }

        this.form.get('year').updateValueAndValidity();
      })
    );

    if (this.worker.socialCareStartDate) {
      this.form.patchValue({
        yearKnown: this.worker.socialCareStartDate.value,
        year: this.worker.socialCareStartDate.year ? this.worker.socialCareStartDate.year : null,
      });
    }

    this.next = [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract)
      ? this.getRoutePath('days-of-sickness')
      : this.getRoutePath('contract-with-zero-hours');
    this.previous = this.getRoutePath('recruited-from');
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'year',
        type: [
          {
            name: 'required',
            message: 'Year is required.',
          },
          {
            name: 'min',
            message: `Year can't be earlier than 100 years ago.`,
          },
          {
            name: 'max',
            message: `Year can't be in future.`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { yearKnown, year } = this.form.value;

    if (!yearKnown) {
      return null;
    }

    return {
      socialCareStartDate: {
        value: yearKnown,
        year: year,
      },
    };
  }
}
