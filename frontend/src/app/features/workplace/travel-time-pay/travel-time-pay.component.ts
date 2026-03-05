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
  selector: 'app-travel-time-pay',
  templateUrl: './travel-time-pay.component.html',
  styleUrls: ['./travel-time-pay.component.scss'],
  standalone: false,
})
export class TravelTimePayComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section: string;
  public payAndPensionQuestionRevealText: string;

  public travelTimePayOptions: any;
  public showTextBox = false;

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
    this.travelTimePayOptions = this.route.snapshot.data.travelTimePayOptions;
    this.payAndPensionQuestionRevealText = this.payAndPensionService.payAndPensionQuestionRevealText;
    this.setSectionHeading();
    this.setupForm();
    if (this.travelTimePayOptions.label === 'A different travel time rate') {
      this.showTextBox = true;
    }
    this.previousQuestionPage = 'how-many-leavers';
    this.skipToQuestionPage = 'benefits-statutory-sick-pay';
    this.nextQuestionPage = this.skipToQuestionPage;
    console.log(this.travelTimePayOptions);
  }

  public setSectionHeading() {
    const inPayAndPensionsMiniFlow = this.payAndPensionService.getInPayAndPensionsMiniFlow();

    this.section = inPayAndPensionsMiniFlow ? 'Workplace' : WorkplaceFlowSections.PAY_AND_BENEFITS;
  }

  private setupForm() {
    this.form = this.formBuilder.group(
      {
        travelTimePay: null,
        travelTimePayRate: null,
      },
      { updateOn: 'submit' },
    );
  }

  public onChange(answer: string) {
    if (answer === 'A different travel time rate') {
      this.showTextBox = true;
      // this.addValidationToControl();
      // this.addErrorLinkFunctionality();
    } else if (answer) {
      this.showTextBox = false;
      // const { pensionPercentage } = this.form.controls;
      // if (pensionPercentage) {
      //   this.form.get('pensionPercentage').clearValidators();
      //   this.form.get('pensionPercentage').updateValueAndValidity();
      // }
    }
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
