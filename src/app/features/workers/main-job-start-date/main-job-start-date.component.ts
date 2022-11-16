import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_DISPLAY_FULL, DATE_PARSE_FORMAT } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
  public section = 'Employment details';

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.form = this.formBuilder.group(
      {
        mainJobStartDate: this.formBuilder.group({
          day: null,
          month: null,
          year: null,
        }),
      },
      { updateOn: 'submit' },
    );

    this.form
      .get('mainJobStartDate')
      .setValidators([DateValidator.dateValid(), DateValidator.todayOrBefore(), DateValidator.min(this.dateMin)]);
  }

  init() {
    if (this.worker.mainJobStartDate) {
      this.prefill();
    }
    this.next = this.getNextRoute();
  }

  private prefill(): void {
    const date = dayjs(this.worker.mainJobStartDate, DATE_PARSE_FORMAT);
    this.form.get('mainJobStartDate').patchValue({
      year: date.year(),
      month: date.format('M'),
      day: date.date(),
    });
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'mainJobStartDate',
        type: [
          {
            name: 'dateValid',
            message: 'Enter a valid main job start date, like 31 3 1980',
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

  private getNextRoute() {
    if (this.workerService.hasJobRole(this.worker, 23)) {
      return this.getRoutePath('nursing-category');
    } else if (this.workerService.hasJobRole(this.worker, 27)) {
      return this.getRoutePath('mental-health-professional');
    } else {
      return this.getRoutePath('recruited-from');
    }
  }
}
