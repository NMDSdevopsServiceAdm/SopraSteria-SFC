import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-staff-benefit-holiday-leave',
  templateUrl: './staff-benefit-holiday-leave.component.html',
})
export class StaffBenefitHolidayLeaveComponent extends Question implements OnInit, OnDestroy {
  public inStaffRecruitmentFlow: boolean;
  public section: string;
  private numberCheckRegex = /^-?\d*(\.\d*)?$/;
  private wholeNumberCheckRegex = /^-?[A-Za-z0-9]*$/;
  private positiveNumberCheckRegex = /^[A-Za-z\d*(.\d*)]*$/;
  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.setupForm();
    this.prefill();
    this.setPreviousRoute();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;

    this.section = this.inStaffRecruitmentFlow ? 'Holiday leave' : 'Staff benefits';
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'confirm-staff-recruitment'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      holidayLeave: [
        null,
        [
          this.customValidator(this.numberCheckRegex, 'nonInteger'),
          this.customValidator(this.positiveNumberCheckRegex, 'negativeNumber'),
          this.customValidator(this.wholeNumberCheckRegex, 'nonWholeNumber'),
        ],
      ],
    });
  }

  private customValidator(regexp: RegExp, error: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const { value } = control;
      const validControlValue = regexp.test(value);
      if (value) {
        return !validControlValue ? { [error]: { value } } : null;
      }
      return null;
    };
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'holidayLeave',
        type: [
          {
            name: 'nonInteger',
            message: 'Number of days must be a number, like 7',
          },
          {
            name: 'nonWholeNumber',
            message: 'Number of days must be a whole number, like 7',
          },

          {
            name: 'negativeNumber',
            message: 'Number of days must be a positive number, like 7',
          },
        ],
      },
    ];
  }
  private prefill(): void {
    if (this.establishment.careWorkersLeaveDaysPerYear) {
      this.form.patchValue({
        holidayLeave: this.establishment.careWorkersLeaveDaysPerYear,
      });
    }
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'pensions'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
