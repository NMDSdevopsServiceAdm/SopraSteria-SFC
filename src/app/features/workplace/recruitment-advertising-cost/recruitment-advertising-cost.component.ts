import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FLOAT_PATTERN } from '@core/constants/constants';
import { jobOptionsEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { tap } from 'rxjs/operators';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-recruitment-advertising-cost',
  templateUrl: './recruitment-advertising-cost.component.html',
})
export class RecruitmentAdvertisingCostComponent extends Question implements OnInit, OnDestroy {
  public amountSpentKnownOptions = [
    {
      label: 'Nothing has been spent on advertising for staff in the last 4 weeks',
      value: jobOptionsEnum.NONE,
    },
    {
      label: 'I do not know how much has been spent on advertising for staff',
      value: jobOptionsEnum.DONT_KNOW,
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
    this.setupForm();
    this.setupFormValueSubscriptions();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;
    this.setRoutes();
    this.prefill();
    this.section = this.inStaffRecruitmentFlow ? 'Advertising spend' : 'Recruitment';
  }

  private setRoutes(): void {
    this.previousRoute = this.inStaffRecruitmentFlow
      ? ['/workplace', `${this.establishment.uid}`, 'staff-recruitment-start']
      : ['/workplace', `${this.establishment.uid}`, 'leavers'];
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'number-of-interviews'];
  }

  private prefill(): void {
    if (this.establishment.moneySpentOnAdvertisingInTheLastFourWeeks) {
      if (
        this.establishment.moneySpentOnAdvertisingInTheLastFourWeeks === jobOptionsEnum.NONE ||
        this.establishment.moneySpentOnAdvertisingInTheLastFourWeeks === jobOptionsEnum.DONT_KNOW
      ) {
        this.form.get('amountSpentKnown').setValue(this.establishment.moneySpentOnAdvertisingInTheLastFourWeeks);
      } else {
        this.form.get('amountSpent').setValue(this.establishment.moneySpentOnAdvertisingInTheLastFourWeeks);
      }
    }
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      amountSpent: [null, [Validators.pattern(FLOAT_PATTERN), this.greaterThanTwoDecimalPlacesValidator()]],
      amountSpentKnown: null,
    });
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

  private setupFormValueSubscriptions(): void {
    this.subscriptions.add(
      this.form.get('amountSpentKnown').valueChanges.subscribe((value) => {
        this.form.get('amountSpent').clearValidators();
        this.form.get('amountSpent').setValue(null, { emitEvent: false });
        this.form.get('amountSpentKnown').setValue(value, { emitEvent: false });
      }),
    );

    this.subscriptions.add(
      this.form.get('amountSpent').valueChanges.subscribe(() => {
        this.form
          .get('amountSpent')
          .setValidators([Validators.pattern(FLOAT_PATTERN), this.greaterThanTwoDecimalPlacesValidator()]);

        if (this.form.get('amountSpentKnown').value !== null) {
          this.form.get('amountSpentKnown').setValue(null, { emitEvent: false });
        }

        this.addErrorLinkFunctionality();
      }),
    );
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'amountSpent',
        type: [
          {
            name: 'greaterThanTwoDecimalPlaces',
            message: 'Amount spent can only have 1 or 2 digits after the decimal point when you include pence',
          },
          {
            name: 'pattern',
            message: 'Enter the amount spent as a positive number, like 100 or 150.99',
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
    const advertisingCostData = {
      property: 'moneySpentOnAdvertisingInTheLastFourWeeks',
      value: props.amountSpent,
    };
    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, advertisingCostData).subscribe(
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
