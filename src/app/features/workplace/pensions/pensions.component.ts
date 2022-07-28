import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FLOAT_PATTERN } from '@core/constants/constants';
import { jobOptionsEnum, PensionsEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { tap } from 'rxjs/operators';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-pensions',
  templateUrl: './pensions.component.html',
})
export class PensionsComponent extends Question implements OnInit, OnDestroy {
  public pensionsOptions = [
    {
      label: 'Yes',
      value: PensionsEnum.YES,
    },
    {
      label: 'No',
      value: PensionsEnum.NO,
    },
    {
      label: "Don't know",
      value: PensionsEnum.DONT_KNOW,
    },
  ];

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
  }

  protected init(): void {
    // this.setupFormValueSubscriptions();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;
    this.setRoutes();
    this.prefill();
    this.section = this.inStaffRecruitmentFlow ? 'Staff benefits' : 'Recruitment';
  }

  private setRoutes(): void {
    this.previousRoute = this.inStaffRecruitmentFlow
      ? ['/workplace', `${this.establishment.uid}`, 'staff-recruitment-start']
      : ['/workplace', `${this.establishment.uid}`, 'leavers'];
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'number-of-interviews'];
  }

  private prefill(): void {
    if (this.establishment.doCareWorkersGetMoreWorkplacePensionContributionThanTheMinimumThreePercent) {
      this.form
        .get('amountSpent')
        .setValue(this.establishment.doCareWorkersGetMoreWorkplacePensionContributionThanTheMinimumThreePercent);
    }
  }

  //   private setupFormValueSubscriptions(): void {
  //     this.subscriptions.add(
  //       this.form.get('amountSpentKnown').valueChanges.subscribe((value) => {
  //         this.form.get('amountSpent').clearValidators();
  //         this.form.get('amountSpent').setValue(null, { emitEvent: false });
  //         this.form.get('amountSpentKnown').setValue(value, { emitEvent: false });
  //       }),
  //     );

  //     this.subscriptions.add(
  //       this.form.get('amountSpent').valueChanges.subscribe(() => {
  //         this.form
  //           .get('amountSpent')
  //           .setValidators([Validators.pattern(FLOAT_PATTERN), this.greaterThanTwoDecimalPlacesValidator()]);

  //         if (this.form.get('amountSpentKnown').value !== null) {
  //           this.form.get('amountSpentKnown').setValue(null, { emitEvent: false });
  //         }

  //         this.addErrorLinkFunctionality();
  //       }),
  //     );
  //   }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'amountSpent',
        type: [
          {
            name: 'greaterThanTwoDecimalPlaces',
            message: 'Amount spent must only include pence, like 132.00 or 150.40',
          },
          {
            name: 'pattern',
            message: 'Amount spent must be a positive number, like 132 or 150.40',
          },
        ],
      },
    ];
  }

  protected generateUpdateProps(): any {
    const { amountSpent, amountSpentKnown } = this.form.value;

    if (amountSpent || amountSpentKnown) {
      return amountSpentKnown ? { amountSpent: amountSpentKnown } : { amountSpent };
    }

    return null;
  }

  protected updateEstablishment(props: any): void {
    this.subscriptions.add(
      this.establishmentService.postStaffRecruitmentData(this.establishment.uid, props).subscribe(
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
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'number-of-interviews'];
  }

  protected addErrorLinkFunctionality(): void {
    if (!this.errorSummaryService.formEl$.value) {
      this.errorSummaryService.formEl$.next(this.formEl);
      this.submitted = false;
    }
  }
}
