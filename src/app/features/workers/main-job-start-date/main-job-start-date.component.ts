import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_DISPLAY_FULL, DATE_PARSE_FORMAT } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@shared/validators/date.validator';
import dayjs from 'dayjs';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-main-job-start-date',
  templateUrl: './main-job-start-date.component.html',
})
export class MainJobStartDateComponent extends QuestionComponent {
  private dateMin = dayjs().subtract(100, 'years');

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      mainJobStartDate: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
    });
    this.form
      .get('mainJobStartDate')
      .setValidators([DateValidator.dateValid(), DateValidator.todayOrBefore(), DateValidator.min(this.dateMin)]);
  }

  init() {
    if (this.worker.mainJobStartDate) {
      const date = dayjs(this.worker.mainJobStartDate, DATE_PARSE_FORMAT);
      this.form.get('mainJobStartDate').patchValue({
        year: date.year(),
        month: date.format('M'),
        day: date.date(),
      });
    }

    this.next = this.getRoutePath('other-job-roles');
    this.previous = this.getReturnPath();

    const { navigatedFrom = null } = history.state;
    if (['staff-records', 'mandatory-details'].includes(navigatedFrom)) this.return = null;
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'mainJobStartDate',
        type: [
          {
            name: 'dateValid',
            message: 'Main job start date is not a valid date',
          },
          {
            name: 'todayOrBefore',
            message: 'Main job start date must be today or in the past',
          },
          {
            name: 'dateMin',
            message: `Main job start date must be after ${this.dateMin.format(DATE_DISPLAY_FULL)}`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { day, month, year } = this.form.get('mainJobStartDate').value;
    const date = day && month && year ? dayjs(`${year}-${month}-${day}`, DATE_PARSE_FORMAT) : null;

    if (date) {
      return {
        mainJobStartDate: date.format(DATE_PARSE_FORMAT),
      };
    }

    return { mainJobStartDate: null };
  }

  private getReturnPath() {
    if (this.workerService.addStaffRecordInProgress$.value) {
      return this.getRoutePath('staff-details');
    }
    if (this.workplace.uid === this.primaryWorkplace.uid) {
      return ['/dashboard'];
    }
    return [`/workplace/${this.workplace.uid}`];
  }
}
