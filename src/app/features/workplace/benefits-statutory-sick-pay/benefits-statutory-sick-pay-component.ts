import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
    this.setPreviousRoute();
    this.inStaffRecruitmentAndBenefitsFlow = this.establishmentService.inStaffRecruitmentFlow;
    // this.prefill();
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'benefits-pension'];
    this.section = this.inStaffRecruitmentAndBenefitsFlow ? `Statutory 'sick pay` : 'Staff benefits';
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'benefits-loyalty-bonus'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        statutorySickPay: null,
      },
      { updateOn: 'submit' },
    );
  }

  // private prefill(): void {
  //   if (this.establishment.doCareWorkersGetPaidMoreThanSickPayWhenTheyCannotWorkBecauseOfIllness) {
  //     this.form.patchValue({
  //       statutorySickPay: this.establishment.doCareWorkersGetPaidMoreThanSickPayWhenTheyCannotWorkBecauseOfIllness,
  //     });
  //   }
  // }

  // protected generateUpdateProps(): any {
  //   const { statutorySickPay } = this.form.value;
  //   if (statutorySickPay) {
  //     return { statutorySickPay };
  //   }
  //   return null;
  // }

  // protected updateEstablishment(props: any): void {
  //   this.subscriptions.add(
  //     this.establishmentService.postStaffRecruitmentData(this.establishment.uid, props).subscribe(
  //       (data) => this._onSuccess(data),
  //       (error) => this.onError(error),
  //     ),
  //   );
  // }

  // protected updateEstablishmentService(): void {
  //   this.establishmentService
  //     .getEstablishment(this.establishmentService.establishmentId)
  //     .pipe(
  //       tap((workplace) => {
  //         return (
  //           this.establishmentService.setWorkplace(workplace), this.establishmentService.setPrimaryWorkplace(workplace)
  //         );
  //       }),
  //     )
  //     .subscribe();
  // }

  // protected onSuccess(): void {
  //   this.updateEstablishmentService();
  //   this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'benefits-pension'];
  // }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
