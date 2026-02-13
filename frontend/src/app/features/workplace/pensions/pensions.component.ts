import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
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
    this.setRoutes();
    this.prefill();
  }

  private setRoutes(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'benefits-statutory-sick-pay'];
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'staff-benefit-holiday-leave'];
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
        (data) => this._onSuccess(data.data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'staff-benefit-holiday-leave'];
  }
}
