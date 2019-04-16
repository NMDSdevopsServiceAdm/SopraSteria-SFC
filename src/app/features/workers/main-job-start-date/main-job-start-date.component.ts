import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@core/validators/date.validator';
import * as moment from 'moment';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-main-job-start-date',
  templateUrl: './main-job-start-date.component.html',
})
export class MainJobStartDateComponent extends QuestionComponent implements OnInit, OnDestroy {
  public backLink: string;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      mainJobStartDate: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
    });
    this.form.get('mainJobStartDate').setValidators([DateValidator.dateValid(), DateValidator.todayOrBefore()]);
  }

  init() {
    if (this.worker.mainJobStartDate) {
      const date = moment(this.worker.mainJobStartDate, DATE_PARSE_FORMAT);
      this.form.patchValue({
        year: date.year(),
        month: date.format('M'),
        day: date.date(),
      });
    }

    // if (this.workerService.returnToSummary) {
    //   this.backLink = 'summary';
    // } else {
    //   this.backLink = this.worker.mainJob.jobId === 27 ? 'mental-health-professional' : 'staff-details';
    // }
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'mainJobStartDate',
        type: [
          {
            name: 'dateValid',
            message: 'DATE IS NOT VALID',
          },
          {
            name: 'todayOrBefore',
            message: 'DATE NEEDS TO BE IN THE PAST',
          },
        ],
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      //   const { day, month, year } = this.form.value;
      //   const date =
      //     day && month && year
      //       ? moment()
      //           .year(year)
      //           .month(month - 1)
      //           .date(day)
      //       : null;

      //   const props = {
      //     mainJobStartDate: date ? date.format(DATE_PARSE_FORMAT) : null,
      //   };

      this.save({});
      //     this.router.navigate(['/worker', this.worker.uid, 'other-job-roles']);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }
}
