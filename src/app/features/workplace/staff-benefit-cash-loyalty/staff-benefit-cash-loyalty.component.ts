import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FLOAT_PATTERN } from '@core/constants/constants';
import { StaffBenefitEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-staff-benefit-cash-loyalty',
  templateUrl: './staff-benefit-cash-loyalty.component.html',
})
export class StaffBenefitCashLoyaltyComponent extends Question implements OnInit, OnDestroy {
  public cashLoyaltyRequiredOptions = [
    {
      label: 'Yes',
      value: StaffBenefitEnum.YES,
    },
    {
      label: 'No',
      value: StaffBenefitEnum.NO,
    },
    {
      label: "Don't know",
      value: StaffBenefitEnum.DONT_KNOW,
    },
  ];

  public showTextBox = false;
  public inStaffRecruitmentFlow: boolean;
  public section: string;
  public submitted = false;
  public submittedWithAddtionalFields = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
    {
      this.form = this.formBuilder.group({
        cashLoyalty: [
          null,
          {
            validators: Validators.required,
            updateOn: 'submit',
          },
        ],
      });
    }
  }

  protected init(): void {
    this.setPreviousRoute();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;
    this.section = this.inStaffRecruitmentFlow ? 'Loyalty bonus' : 'Staff benefits';
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'sick-pay'];
    this.establishment;
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'accept-previous-care-certificate'];
  }

  public onChange(answer: string) {
    if (answer === 'Yes') {
      this.showTextBox = true;
      this.addControl();
      this.addValidationToControl();
    } else if (answer) {
      this.showTextBox = false;
      const { cashAmount } = this.form.controls;
      if (cashAmount) {
        this.form.removeControl('cashAmount');
      }
    }
  }

  public addControl() {
    this.form.addControl('cashAmount', new FormControl(null, { updateOn: 'submit' }));
  }

  public addValidationToControl() {
    this.form
      .get('cashAmount')
      .addValidators([Validators.pattern(FLOAT_PATTERN), this.greaterThanTwoDecimalPlacesValidator()]);
  }

  private greaterThanTwoDecimalPlacesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const { value } = control;
      if (value && value.includes('.')) {
        const splitValue = value.split('.');
        return splitValue[1].length > 2 ? { greaterThanTwoDecimalPlaces: { value: control.value } } : null;
      }
      return null;
    };
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'cashAmount',
        type: [
          {
            name: 'greaterThanTwoDecimalPlaces',
            message: 'Amount must only include pence, like 132.00 or 150.40',
          },
          {
            name: 'pattern',
            message: 'Amount must be a positive number, like 132 or 150.40',
          },
        ],
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
