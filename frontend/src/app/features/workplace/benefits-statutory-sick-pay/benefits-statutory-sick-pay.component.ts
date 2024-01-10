import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffBenefitEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-benefits-statutory-sick-pay',
  templateUrl: './benefits-statutory-sick-pay.component.html',
})
export class BenefitsStatutorySickPayComponent extends Question implements OnInit, OnDestroy {
  public statuorySickPayOptions = [
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

  public inStaffRecruitmentAndBenefitsFlow: boolean;
  public section: string;

  constructor(
    protected formBuilder: UntypedFormBuilder,
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
    this.inStaffRecruitmentAndBenefitsFlow = this.establishmentService.inStaffRecruitmentFlow;

    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'pensions'];
    this.section = this.inStaffRecruitmentAndBenefitsFlow ? 'Statutory Sick Pay' : 'Staff benefits';
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'cash-loyalty'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        statutorySickPay: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    if (this.establishment.sickPay) {
      this.form.patchValue({
        statutorySickPay: this.establishment.sickPay,
      });
    }
  }

  protected generateUpdateProps(): any {
    const { statutorySickPay } = this.form.value;
    if (statutorySickPay) {
      return { statutorySickPay };
    }
    return null;
  }

  protected updateEstablishment(props: any): void {
    const sickPayData = {
      property: 'sickPay',
      value: props.statutorySickPay,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, sickPayData).subscribe(
        (data) => this._onSuccess(data.data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'pensions'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
