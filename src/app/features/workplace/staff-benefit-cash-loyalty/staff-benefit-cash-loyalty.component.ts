import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FLOAT_PATTERN } from '@core/constants/constants';
import { StaffBenefitEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { tap } from 'rxjs/operators';

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
      label: `Don't know`,
      value: StaffBenefitEnum.DONT_KNOW,
    },
  ];

  public showTextBox = false;
  public inStaffRecruitmentFlow: boolean;
  public section: string;

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
        cashLoyalty: null,
      });
    }
  }

  protected init(): void {
    this.prefill();
    this.setPreviousRoute();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;
    this.section = this.inStaffRecruitmentFlow ? 'Loyalty bonus' : 'Staff benefits';
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'benefits-statutory-sick-pay'];
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
        this.form.get('cashAmount').clearValidators();
        this.form.get('cashAmount').updateValueAndValidity();
      }
    }
  }

  private prefill(): void {
    if (this.establishment.careWorkersCashLoyaltyForFirstTwoYears) {
      if (Number(this.establishment.careWorkersCashLoyaltyForFirstTwoYears)) {
        this.form.get('cashLoyalty').setValue(StaffBenefitEnum.YES, { onlyself: false, emitEvent: true });
        this.onChange(StaffBenefitEnum.YES);
        this.form.get('cashAmount').setValue(this.establishment.careWorkersCashLoyaltyForFirstTwoYears);
      } else {
        this.form.get('cashLoyalty').setValue(this.establishment.careWorkersCashLoyaltyForFirstTwoYears);
      }
    }
  }

  public addControl() {
    if (!this.form.controls.cashAmount) {
      this.form.addControl('cashAmount', new FormControl(null, { updateOn: 'submit' }));
    }
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

  protected generateUpdateProps(): any {
    const { cashLoyalty, cashAmount } = this.form.value;
    if (cashLoyalty === 'Yes' && cashAmount) {
      return cashAmount;
    }
    if (cashLoyalty) {
      return cashLoyalty;
    }

    return null;
  }

  protected updateEstablishment(props: any): void {
    const cashLoyaltyData = {
      property: 'careWorkersCashLoyaltyForFirstTwoYears',
      value: props,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, cashLoyaltyData).subscribe(
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
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'benefits-statutory-sick-pay'];
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'cashAmount',
        type: [
          {
            name: 'greaterThanTwoDecimalPlaces',
            message: 'Amount can only have 1 or 2 digits after the decimal point when you include pence',
          },
          {
            name: 'pattern',
            message: 'Enter the amount as a positive number, like 100 or 150.99',
          },
        ],
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
