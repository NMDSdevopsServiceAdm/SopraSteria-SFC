import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkplaceQuestion } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ProgressBarUtil, WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-how-do-you-pay-for-sleep-ins',
  templateUrl: './how-do-you-pay-for-sleep-ins.component.html',
  standalone: false,
})
export class HowDoYouPayForSleepInsComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section: string;
  public sectionHeading: string;
  public payAndPensionQuestionRevealText: string;
  public options = ['Hourly rate', 'Flat rate', 'I do not know'];
  public inPayAndPensionsMiniFlow: boolean = false;
  public progressBarSections: string[];
  public showProgressBar: boolean = false;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
    protected payAndPensionService: PayAndPensionService,
    private previousRouteService: PreviousRouteService,
    protected alertService: AlertService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init(): void {
    this.inPayAndPensionsMiniFlow = this.payAndPensionService.getInPayAndPensionsMiniFlow();
    this.payAndPensionQuestionRevealText = this.payAndPensionService.payAndPensionQuestionRevealText;
    this.showProgressBar = (!this.return || this.inPayAndPensionsMiniFlow) ?? false;
    this.setSectionHeading();
    this.setupForm();
    this.prefill();
    this.setProgressBarSections();
    this.setSkipRoute();
    this.previousQuestionPage = 'workplace-offer-sleep-ins';
    this.nextQuestionPage = this.skipToQuestionPage;
    this.payAndPensionService.clearInPayAndPensionsMiniFlowWhenClickedAway();
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

  private setupForm() {
    this.form = this.formBuilder.group(
      {
        howToPayForSleepIn: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    const howToPayForSleepIn = this.establishment.howToPayForSleepIn;

    if (!howToPayForSleepIn) return;

    this.form.patchValue({
      howToPayForSleepIn,
    });
  }

  protected generateUpdateProps(): any {
    const { howToPayForSleepIn } = this.form.value;

    if (!howToPayForSleepIn) {
      return null;
    }

    return howToPayForSleepIn;
  }

  protected updateEstablishment(props: any): void {
    if (!props) {
      return;
    }

    const howToPayForSleepInData = {
      property: 'howToPayForSleepIn',
      value: props,
    };

    this.subscriptions.add(
      this.establishmentService
        .updateSingleEstablishmentField(this.establishment.uid, howToPayForSleepInData)
        .subscribe(
          (data) => this._onSuccess(data.data),
          (error) => this.onError(error),
        ),
    );
  }

  protected setBackLink(): void {
    const isInWorkflow = !this.return;

    const previousPage = this.previousRouteService.getPreviousPage();
    const previousPageWasOfferSleepIns = previousPage === this.previousQuestionPage;

    if (isInWorkflow || previousPageWasOfferSleepIns) {
      this.back = { url: this.previousRoute };
    } else {
      this.back = this.return;
    }

    this.backService.setBackLink(this.back);
  }

  private setSkipRoute(): void {
    this.skipToQuestionPage = 'do-you-have-vacancies';
    if (this.inPayAndPensionsMiniFlow) {
      this.isAtEndOfMiniFlow = true;
    }
  }

  protected onSuccess(): void {
    if (this.inPayAndPensionsMiniFlow && this.establishment.mainService.payAndPensionsGroup === 2) {
      this.submitAction = { action: 'return', save: true };
    }
  }

  public addAlert(): void {
    if (this.inPayAndPensionsMiniFlow) {
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
