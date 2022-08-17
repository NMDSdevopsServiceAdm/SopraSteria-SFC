import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { tap } from 'rxjs/operators';

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
    this.skipRoute = this.inStaffRecruitmentFlow
      ? ['/workplace', `${this.establishment.uid}`, 'confirm-staff-recruitment-and-benefits']
      : ['/workplace', `${this.establishment.uid}`, 'sharing-data'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        holidayLeave: [
          null,
          [
            this.customValidator(this.numberCheckRegex, 'nonInteger'),
            this.customValidator(this.positiveNumberCheckRegex, 'negativeNumber'),
            this.customValidator(this.wholeNumberCheckRegex, 'nonWholeNumber'),
          ],
        ],
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    if (this.establishment.careWorkersLeaveDaysPerYear) {
      this.form.patchValue({
        holidayLeave: this.establishment.careWorkersLeaveDaysPerYear,
      });
    }
  }

  protected generateUpdateProps(): any {
    const { holidayLeave } = this.form.value;
    if (holidayLeave) {
      return { holidayLeave };
    }
    return null;
  }

  protected updateEstablishment(props: any): void {
    const holidayLeaveData = {
      property: 'careWorkersLeaveDaysPerYear',
      value: props.holidayLeave,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, holidayLeaveData).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected updateEstablishmentService(): void {
    this.establishmentService
      .getEstablishment(this.establishmentService.establishmentId)
      .pipe(
        tap((workplace) => {
          return (
            this.establishmentService.setWorkplace(workplace), this.establishmentService.setPrimaryWorkplace(workplace)
          );
        }),
      )
      .subscribe();
  }

  protected onSuccess(): void {
    this.updateEstablishmentService();
    this.nextRoute = this.inStaffRecruitmentFlow
      ? ['/workplace', `${this.establishment.uid}`, 'confirm-staff-recruitment-and-benefits']
      : ['/workplace', `${this.establishment.uid}`, 'sharing-data'];
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
            message: 'Number of days must be a positive whole number, like 20',
          },
          {
            name: 'nonWholeNumber',
            message: 'Number of days must be a positive whole number, like 20',
          },

          {
            name: 'negativeNumber',
            message: 'Number of days must be a positive whole number, like 20',
          },
        ],
      },
    ];
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'pensions'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
