import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffBenefitEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-pensions',
  templateUrl: './pensions.component.html',
  standalone: false,
})
export class PensionsComponent extends Question implements OnInit, OnDestroy {
  public pensionsOptions = [
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

  public section = WorkplaceFlowSections.PAY_AND_BENEFITS;
  public minPercentage = 3;
  public maxPercentage = 100;
  public showPercentageTextBox = false;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
    this.form = this.formBuilder.group(
      {
        pension: null,
        pensionPercentage: null,
      },
      { updateOn: 'submit' },
    );
  }

  protected init(): void {
    this.setRoutes();
    this.prefill();

    if (this.establishment.pensionContribution === 'Yes') {
      this.showPercentageTextBox = true;
    }
  }

  private setRoutes(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'benefits-statutory-sick-pay'];
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'staff-benefit-holiday-leave'];
  }

  public onChange(answer: string) {
    if (answer === 'Yes') {
      this.showPercentageTextBox = true;
      this.addValidationToControl();
      this.addErrorLinkFunctionality();
    } else if (answer) {
      this.showPercentageTextBox = false;
      const { pensionPercentage } = this.form.controls;
      if (pensionPercentage) {
        this.form.get('pensionPercentage').clearValidators();
        this.form.get('pensionPercentage').updateValueAndValidity();
      }
    }
  }

  public addValidationToControl() {
    this.form.get('pensionPercentage')?.setValidators([this.minMaxValidator(this.minPercentage, this.maxPercentage)]);
    this.form.get('pensionPercentage').updateValueAndValidity();
  }

  private minMaxValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue < min || numericValue > max) {
        return { minMax: true };
      }

      return null;
    };
  }

  private prefill(): void {
    if (this.establishment.pensionContribution) {
      this.form.patchValue({
        pension: this.establishment.pensionContribution,
        pensionPercentage: this.establishment.pensionContributionPercentage,
      });

      this.onChange(this.establishment.pensionContribution);
    }
  }

  protected generateUpdateProps(): any {
    const { pension, pensionPercentage } = this.form.value;
    if (!pension) return null;

    const payload: any = {
      pension: {
        pensionContribution: pension,
      },
    };

    if (pension === 'Yes' && pensionPercentage != null) {
      payload.pension.pensionContributionPercentage = pensionPercentage;
    }

    return payload;
  }

  protected updateEstablishment(props: any): void {
    if (!props) return;

    const payload = props.pension;

    this.subscriptions.add(
      this.establishmentService.updatePensionContribution(this.establishment.uid, payload).subscribe(
        (data) => this._onSuccess(data.data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'staff-benefit-holiday-leave'];
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'pensionPercentage',
        type: [{ name: 'minMax', message: 'Actual contribution must be higher than 3% and no more than 100%' }],
      },
    ];
  }
  protected addErrorLinkFunctionality(): void {
    if (!this.errorSummaryService.formEl$.value) {
      this.errorSummaryService.formEl$.next(this.formEl);
    }
  }
}
