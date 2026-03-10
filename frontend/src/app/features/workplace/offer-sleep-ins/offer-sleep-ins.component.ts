import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkplaceQuestion } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ProgressBarUtil, WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-offer-sleep-ins',
  templateUrl: './offer-sleep-ins.component.html',
  standalone: false,
})
export class OfferSleepInsComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section: string;
  public sectionHeading: string;
  public options = YesNoDontKnowOptions;
  public inPayAndPensionsMiniFlow: boolean = false;
  public progressBarSections: string[];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
    protected payAndPensionService: PayAndPensionService,
    protected alertService: AlertService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init(): void {
    this.inPayAndPensionsMiniFlow = this.payAndPensionService.getInPayAndPensionsMiniFlow();
    this.setSectionHeading();
    this.setupForm();
    this.setPreviousRoute();
    this.prefill();
    this.setProgressBarSections();
    this.setSkipRoute();
    this.nextQuestionPage = this.skipToQuestionPage;
  }

  public setSectionHeading() {
    this.sectionHeading = this.inPayAndPensionsMiniFlow ? 'Workplace' : WorkplaceFlowSections.SERVICES;
  }

  private setProgressBarSections(): void {
    const payAndPensionsMiniFlowGroup2BarSections = ProgressBarUtil.payAndPensionsMiniFlowGroup2BarSections();

    if (this.inPayAndPensionsMiniFlow) {
      this.progressBarSections = payAndPensionsMiniFlowGroup2BarSections;
      this.section = payAndPensionsMiniFlowGroup2BarSections[2];
    } else {
      this.progressBarSections = this.workplaceFlowSections;
      this.section = WorkplaceFlowSections.SERVICES;
    }
  }

  setupForm() {
    this.form = this.formBuilder.group(
      {
        offerSleepIn: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    const offerSleepIn = this.establishment.offerSleepIn;

    if (!offerSleepIn) return;

    this.form.patchValue({
      offerSleepIn,
    });
  }

  private setPreviousRoute(): void {
    if (this.inPayAndPensionsMiniFlow) {
      this.previousQuestionPage = 'staff-opt-out-of-workplace-pension';
    } else {
      this.previousQuestionPage = this.establishment.mainService.canDoDelegatedHealthcareActivities
        ? 'what-kind-of-delegated-healthcare-activities'
        : 'service-users';
    }
  }

  private setSkipRoute(): void {
    this.skipToQuestionPage = 'do-you-have-vacancies';
    if (this.inPayAndPensionsMiniFlow) {
      this.isAtEndOfMiniFlow = true;
    }
  }

  protected generateUpdateProps(): any {
    const { offerSleepIn } = this.form.value;

    if (!offerSleepIn) {
      return null;
    }

    return { offerSleepIn };
  }

  protected updateEstablishment(props: any): void {
    if (!props) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService
        .updateEstablishmentFieldWithAudit(this.establishment.uid, 'OfferSleepIn', props)
        .subscribe(
          (data) => this._onSuccess(data),
          (error) => this.onError(error),
        ),
    );
  }

  protected onSuccess(): void {
    const { offerSleepIn } = this.form.value;

    if (offerSleepIn === 'Yes') {
      this.nextQuestionPage = 'how-do-you-pay-for-sleep-ins';
      this.submitAction = { action: 'continue', save: true };
    } else if (this.inPayAndPensionsMiniFlow && this.establishment.mainService.payAndPensionsGroup === 2) {
      this.submitAction = { action: 'return', save: true };
    } else {
      this.nextQuestionPage = this.skipToQuestionPage;
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

  public addAlert(): void {
    const { offerSleepIn } = this.form.value;
    if (offerSleepIn !== 'Yes' && this.inPayAndPensionsMiniFlow) {
      this.alertService.addAlert({
        type: 'success',
        message: 'Your information has been saved in Workplace',
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
