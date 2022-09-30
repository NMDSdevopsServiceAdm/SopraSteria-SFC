import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { INT_PATTERN } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-year-arrived-uk',
  templateUrl: './year-arrived-uk.component.html',
})
export class YearArrivedUkComponent extends QuestionComponent {
  public intPattern = INT_PATTERN.toString();
  public section = 'Personal details';
  private mainJobStartDatePath: string[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);

    this.form = this.formBuilder.group({
      yearKnown: null,
      year: null,
    });
  }

  init() {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    this.setUpPageRouting();
    this.setupFormValidation();

    if (this.worker.yearArrived) {
      this.prefill();
    }
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'year',
        type: [
          {
            name: 'required',
            message: 'Enter the year',
          },
          {
            name: 'min',
            message: 'Year cannot be more than 100 years ago',
          },
          {
            name: 'max',
            message: 'Year cannot be in the future',
          },
          {
            name: 'pattern',
            message: 'Enter a valid year, like 2021',
          },
        ],
      },
    ];
  }

  private setupFormValidation() {
    this.subscriptions.add(
      this.form.get('yearKnown').valueChanges.subscribe((value) => {
        this.form.get('year').clearValidators();

        if (value === 'Yes') {
          this.form
            .get('year')
            .setValidators([
              Validators.required,
              Validators.min(dayjs().subtract(100, 'years').year()),
              Validators.max(dayjs().year()),
              Validators.pattern('^[0-9]*$'),
            ]);
        }

        this.form.get('year').updateValueAndValidity();
      }),
    );
  }

  private prefill() {
    this.form.patchValue({
      yearKnown: this.worker.yearArrived.value,
      year: this.worker.yearArrived.year ? this.worker.yearArrived.year : null,
    });
  }

  generateUpdateProps() {
    const yearKnown = this.form.value.yearKnown;
    const year = Number(this.form.value.year);

    if (yearKnown) {
      return {
        yearArrived: {
          value: yearKnown,
          year,
        },
      };
    }

    return null;
  }

  private setUpPageRouting() {
    this.staffRecordSummaryPath = this.getRoutePath('staff-record-summary');
    this.mainJobStartDatePath = this.getRoutePath('main-job-start-date');

    if (this.insideFlow) {
      this.backService.setBackLink({ url: this.getRoutePath('country-of-birth') });
      this.skipRoute = this.mainJobStartDatePath;
      this.next = this.mainJobStartDatePath;
    } else {
      this.return = { url: this.staffRecordSummaryPath };
      this.backService.setBackLink({ url: this.staffRecordSummaryPath });
    }
  }
}
