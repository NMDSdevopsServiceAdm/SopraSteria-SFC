import { Component, OnDestroy, OnInit } from '@angular/core';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { ProgressBarUtil, WorkplaceFlowSections } from '@core/utils/progress-bar-util';

import { WorkplaceQuestion } from '../question/question.component';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';


@Component({
  selector: 'app-staff-opt-out-of-workplace-pension',
  templateUrl: './staff-opt-out-of-workplace-pension.component.html',
  standalone: false,
})
export class StaffOptOutOfWorkplacePensionComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section: string;
  public options = YesNoDontKnowOptions;
  public sectionHeading: string;
  public inPayAndPensionsMiniFlow: boolean = false;
  public progressBarSections: string[];
  public showProgressBar: boolean = false;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected payAndPensionService: PayAndPensionService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init(): void {
    this.inPayAndPensionsMiniFlow = this.payAndPensionService.getInPayAndPensionsMiniFlow();
    this.showProgressBar = (!this.return || this.inPayAndPensionsMiniFlow) ?? false;
    this.setSectionHeading();
    this.setupForm();
    this.prefill();
    this.setupRoutes();
    this.setProgressBarSections();
  }

  private setSectionHeading(): void {
    this.sectionHeading = this.inPayAndPensionsMiniFlow ? 'Workplace' : WorkplaceFlowSections.PAY_AND_BENEFITS;
  }

  private setProgressBarSections(): void {
    const payAndPensionsMiniFlowGroup2BarSections = ProgressBarUtil.payAndPensionsMiniFlowGroup2BarSections();

    if (this.inPayAndPensionsMiniFlow) {
      this.progressBarSections = payAndPensionsMiniFlowGroup2BarSections;
      this.section = payAndPensionsMiniFlowGroup2BarSections[1];
    } else {
      this.progressBarSections = this.workplaceFlowSections;
      this.section = WorkplaceFlowSections.PAY_AND_BENEFITS;
    }
  }

  public setBackLink(): void {
    if (this.inPayAndPensionsMiniFlow) {
      this.back = { url: this.previousRoute };
    } else {
      this.back = this.return;
    }
    this.backService.setBackLink(this.back);
  }

  protected setupRoutes(): void {
    this.previousQuestionPage = 'pensions';
    this.skipToQuestionPage = 'staff-benefit-holiday-leave';

    if (this.inPayAndPensionsMiniFlow) {
      this.skipToQuestionPage = 'workplace-offer-sleep-ins';
    }
    this.nextQuestionPage = this.skipToQuestionPage;
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group(
      {
        staffOptOutOfWorkplacePension: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    const staffOptOutOfWorkplacePension = this.establishment.staffOptOutOfWorkplacePension;
    if (staffOptOutOfWorkplacePension) {
      this.form.patchValue({
        staffOptOutOfWorkplacePension,
      });
    }
  }

  protected generateUpdateProps(): any {
    const { staffOptOutOfWorkplacePension } = this.form.value;

    return staffOptOutOfWorkplacePension ?? null;
  }

  protected updateEstablishment(props: string | null): void {
    if (!props) {
      return;
    }

    const updateData = {
      property: 'staffOptOutOfWorkplacePension',
      value: props,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, updateData).subscribe(
        (data) => this._onSuccess(data.data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    if (this.inPayAndPensionsMiniFlow) {
      this.submitAction = { action: 'continue', save: true };
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
