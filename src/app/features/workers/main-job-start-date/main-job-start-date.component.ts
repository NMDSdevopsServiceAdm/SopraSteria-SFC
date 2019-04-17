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

  private getUpdateProps() {
    const { day, month, year } = this.form.get('mainJobStartDate').value;
    const date = day && month && year ? moment(`${year}-${month}-${day}`, DATE_PARSE_FORMAT) : null;

    return {
      mainJobStartDate: date ? date.format(DATE_PARSE_FORMAT) : null,
    };
  }

  public onSubmit(payload: { action: string; save: boolean }): void {
    if (payload.save) {
      this.submitted = true;
      this.errorSummaryService.syncFormErrorsEvent.next(true);

      if (this.form.valid) {
        const props = this.getUpdateProps();

        this.save(props);
        this.router.navigate(['/worker', this.worker.uid, 'other-job-roles']);
      } else {
        this.errorSummaryService.scrollToErrorSummary();
      }
    }

    switch (payload.action) {
      case 'continue':
        console.log('next question');
        break;

      case 'summary':
        console.log('summary page');
        break;

      case 'exit':
        this.router.navigate(['/dashboard']);
        break;

      case 'return':
        console.log('return');
        break;
    }
  }
}
