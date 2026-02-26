import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkplaceQuestion } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { PreviousRouteService } from '@core/services/previous-route.service';

@Component({
  selector: 'app-how-do-you-pay-for-sleep-ins',
  templateUrl: './how-do-you-pay-for-sleep-ins.component.html',
  standalone: false,
})
export class HowDoYouPayForSleepInsComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section: string;
  public payAndPensionQuestionRevealText: string;
  public options = ['Hourly rate', 'Flat rate', 'I do not know'];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
    protected payAndPensionService: PayAndPensionService,
    private previousRouteService: PreviousRouteService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init(): void {
    this.payAndPensionQuestionRevealText = this.payAndPensionService.payAndPensionQuestionRevealText;
    this.setSectionHeading();
    this.setupForm();
    this.prefill();
    this.previousQuestionPage = 'workplace-offer-sleep-ins';
    this.skipToQuestionPage = 'do-you-have-vacancies';
    this.nextQuestionPage = this.skipToQuestionPage;
  }

  public setSectionHeading() {
    const inPayAndPensionsMiniFlow = this.payAndPensionService.getInPayAndPensionsMiniFlow();

    this.section = inPayAndPensionsMiniFlow ? 'Workplace' : WorkplaceFlowSections.SERVICES;
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
