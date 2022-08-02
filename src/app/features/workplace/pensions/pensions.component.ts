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
    this.setupForm();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;
    this.setRoutes();
    this.prefill();
    this.section = this.inStaffRecruitmentFlow ? 'Pensions' : 'Staff benefits';
  }

  private setRoutes(): void {
    this.previousRoute = this.inStaffRecruitmentFlow
      ? ['/workplace', `${this.establishment.uid}`, 'benefits-statutory-sick-pay']
      : ['/workplace', `${this.establishment.uid}`, 'benefits-statutory-sick-pay'];
    // this.skipRoute = ['/workplace', `${this.establishment.uid}`, ''];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        pension: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    if (this.establishment.pensionContribution) {
      this.form.patchValue({
        pension: this.establishment.pensionContribution,
      });
    }
  }

  protected generateUpdateProps(): any {
    const { pension } = this.form.value;
    if (pension) {
      return { pension };
    }
    return null;
  }

  protected updateEstablishment(props: any): void {
    const pensionData = {
      property: 'pensionContribution',
      value: props.pension,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, pensionData).subscribe(
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
}
