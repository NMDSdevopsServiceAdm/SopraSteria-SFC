import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-year-arrived-uk',
  templateUrl: './year-arrived-uk.component.html',
})
export class YearArrivedUkComponent extends QuestionComponent {
  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      yearKnown: null,
      year: null,
    });
  }

  init() {
    if (this.worker.countryOfBirth && this.worker.countryOfBirth.value === 'United Kingdom') {
      this.router.navigate(['/worker', this.worker.uid, 'country-of-birth'], { replaceUrl: true });
    }

    this.subscriptions.add(
      this.form.get('yearKnown').valueChanges.subscribe(value => {
        this.form.get('year').reset();
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

    if (this.worker.yearArrived) {
      this.form.patchValue({
        yearKnown: this.worker.yearArrived.value,
        year: this.worker.yearArrived.year ? this.worker.yearArrived.year : null,
      });
    }

    this.next = ['/worker', this.worker.uid, 'recruited-from'];
    this.previous = ['/worker', this.worker.uid, 'country-of-birth'];
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

    if (yearKnown) {
      return {
        yearArrived: {
          value: yearKnown,
          year: year,
        },
      };
    }

    return null;
  }
}
