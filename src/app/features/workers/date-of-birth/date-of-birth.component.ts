import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_DISPLAY_DEFAULT, DATE_PARSE_FORMAT } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@shared/validators/date.validator';
import * as moment from 'moment';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-date-of-birth',
  templateUrl: './date-of-birth.component.html',
})
export class DateOfBirthComponent extends QuestionComponent {
  private minDate = moment()
    .subtract(100, 'years')
    .add(1, 'days');
  private maxDate = moment().subtract(14, 'years');

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      dob: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
    });
    this.form.get('dob').setValidators([DateValidator.dateValid(), DateValidator.between(this.minDate, this.maxDate)]);
  }

  init() {
    if (this.worker.dateOfBirth) {
      const date = moment(this.worker.dateOfBirth, DATE_PARSE_FORMAT);
      this.form.get('dob').patchValue({
        year: date.year(),
        month: date.format('M'),
        day: date.date(),
      });
    }

    this.next = this.getRoutePath('home-postcode');
    this.previous = this.getRoutePath('national-insurance-number');
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'dob',
        type: [
          {
            name: 'dateValid',
            message: 'The date you entered is in the wrong format',
          },
          {
            name: 'dateBetween',
            message: `The date has to be between ${this.minDate.format(DATE_DISPLAY_DEFAULT)} and ${this.maxDate.format(
              DATE_DISPLAY_DEFAULT
            )}.`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { day, month, year } = this.form.get('dob').value;
    const date = day && month && year ? moment(`${year}-${month}-${day}`, DATE_PARSE_FORMAT) : null;

    if (date) {
      return {
        dateOfBirth: date.format(DATE_PARSE_FORMAT),
      };
    }

    return null;
  }
}
