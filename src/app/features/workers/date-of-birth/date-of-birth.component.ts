import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_DISPLAY_DEFAULT, DATE_PARSE_FORMAT } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@shared/validators/date.validator';
import dayjs from 'dayjs';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-date-of-birth',
  templateUrl: './date-of-birth.component.html',
})
export class DateOfBirthComponent extends QuestionComponent implements AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public minDate = dayjs().subtract(100, 'years').add(1, 'days');
  public maxDate = dayjs().subtract(14, 'years');
  public section = 'Personal details';

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    public workerService: WorkerService,
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
        dob: this.formBuilder.group({
          day: null,
          month: null,
          year: null,
        }),
      },
      { updateOn: 'submit' },
    );
    this.form.get('dob').setValidators([DateValidator.dateValid(), DateValidator.between(this.minDate, this.maxDate)]);
  }

  init(): void {
    if (this.worker.dateOfBirth) {
      const date = dayjs(this.worker.dateOfBirth, DATE_PARSE_FORMAT);
      this.form.get('dob').patchValue({
        year: date.year(),
        month: date.format('M'),
        day: date.date(),
      });
    }
    this.next = this.getRoutePath('national-insurance-number');
    this.previous = this.getReturnPath();
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'dob',
        type: [
          {
            name: 'dateValid',
            message: 'Enter a valid date of birth, like 31 3 1980',
          },
          {
            name: 'dateBetween',
            message: `Date of birth must to be between ${this.minDate.format(
              DATE_DISPLAY_DEFAULT,
            )} and ${this.maxDate.format(DATE_DISPLAY_DEFAULT)}.`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { day, month, year } = this.form.get('dob').value;
    const date = day && month && year ? dayjs(`${year}-${month}-${day}`, DATE_PARSE_FORMAT) : null;

    if (date) {
      return {
        dateOfBirth: date.format(DATE_PARSE_FORMAT),
      };
    }

    return { dateOfBirth: null };
  }

  private getReturnPath() {
    if (this.insideFlow && this.workerService.addStaffRecordInProgress) {
      return this.getRoutePath('mandatory-details');
    }

    if (this.insideFlow) {
      return this.workplace?.uid === this.primaryWorkplace?.uid ? ['/dashboard'] : [`/workplace/${this.workplace.uid}`];
    }
    return this.getRoutePath('');
  }
}
