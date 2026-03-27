import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkplaceQuestion } from '../question/question.component';
import { AbstractControl, UntypedFormBuilder, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ProgressBarUtil, WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { TravelTimePayOptions } from '@core/model/travel-time-pay.model';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-travel-time-pay',
  templateUrl: './travel-time-pay.component.html',
  styleUrls: ['./travel-time-pay.component.scss'],
  standalone: false,
})
export class TravelTimePayComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section: string;
  public payAndPensionQuestionRevealText: string;
  public sectionHeading: string;
  public travelTimePayOptions: TravelTimePayOptions[];
  public showTextBox = false;
  public inPayAndPensionsMiniFlow: boolean = false;
  public progressBarSections: string[];
  public showProgressBar: boolean = false;
  public payAndPensionsGroup: number;

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
    this.travelTimePayOptions = this.route.snapshot.data.travelTimePayOptions;
    this.inPayAndPensionsMiniFlow = this.payAndPensionService.getInPayAndPensionsMiniFlow();
    this.showProgressBar = (!this.return || this.inPayAndPensionsMiniFlow) ?? false;
    this.payAndPensionQuestionRevealText = this.payAndPensionService.payAndPensionQuestionRevealText;
    this.payAndPensionsGroup = this.establishment?.mainService?.payAndPensionsGroup;
    this.setSectionHeading();
    this.setupForm();
    this.prefill();
    this.setProgressBarSections();
    if (this.form.get('travelTimePay')?.value === 3) {
      this.showTextBox = true;
    }
    this.setPreviousRoute();
    this.setSkipRoute();
    this.nextQuestionPage = this.skipToQuestionPage;
    this.payAndPensionService.clearInPayAndPensionsMiniFlowWhenClickedAway();
  }

  private setProgressBarSections(): void {
    if (this.inPayAndPensionsMiniFlow) {
      this.progressBarSections = this.payAndPensionService.getPayAndPensionsMiniFlowProgressBarSections(
        this.payAndPensionsGroup,
      );
      this.section = this.progressBarSections[3];
    } else {
      this.progressBarSections = this.workplaceFlowSections;
      this.section = WorkplaceFlowSections.PAY_AND_BENEFITS;
    }
  }

  public setSectionHeading(): void {
    this.sectionHeading = this.inPayAndPensionsMiniFlow ? 'Workplace' : WorkplaceFlowSections.PAY_AND_BENEFITS;
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

  public onChange(answer: TravelTimePayOptions) {
    if (answer?.includeRate) {
      this.showTextBox = true;
      this.addValidationToControl();
      this.addErrorLinkFunctionality();
    } else if (answer) {
      this.showTextBox = false;
      const { travelTimePayRate } = this.form.controls;
      if (travelTimePayRate) {
        this.form.get('travelTimePayRate').clearValidators();
        this.form.get('travelTimePayRate').updateValueAndValidity();
      }
    }
  }

  public addValidationToControl() {
    this.form
      .get('travelTimePayRate')
      ?.setValidators([this.minMaxValidator(2.5, 200), this.maxTwoDecimalPlacesValidator()]);
    this.form.get('travelTimePayRate').updateValueAndValidity();
  }

  private maxTwoDecimalPlacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null; // let required validator handle empties
      }

      const stringValue = value.toString();

      const decimalPart = stringValue.split('.')[1];

      if (decimalPart && decimalPart.length > 2) {
        return { maxTwoDecimals: true };
      }

      return null;
    };
  }

  private minMaxValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue < min || numericValue > max) {
        return { minMax: true };
      }

      return null;
    };
  }
  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'travelTimePayRate',
        type: [
          { name: 'minMax', message: 'Travel time rate amount must be higher than 2.50 and no more than 200' },
          {
            name: 'maxTwoDecimals',
            message: 'You can only have 1 or 2 digits for pence after the decimal point',
          },
        ],
      },
    ];
  }

  private prefill(): void {
    if (this.establishment.travelTimePay) {
      this.form.patchValue({
        travelTimePay: this.establishment.travelTimePay.id,
        travelTimePayRate: this.establishment.travelTimePay.rate
          ? this.establishment.travelTimePay.rate.toFixed(2)
          : null,
      });

      this.onChange(this.establishment.travelTimePay);
    }
  }

  generateUpdateProps() {
    const { travelTimePay, travelTimePayRate } = this.form.value;

    if (!travelTimePay) {
      return null;
    }

    const chosenId = travelTimePay;
    const chosenOption = this.travelTimePayOptions.find((option) => option.id === chosenId);
    const chosenOptionIncludeRate = chosenOption?.includeRate;

    const updateProps = chosenOptionIncludeRate ? { id: chosenId, rate: travelTimePayRate } : { id: chosenId };
    return { travelTimePay: updateProps };
  }

  updateEstablishment(props: any): void {
    if (!props) return;
    const property = 'TravelTimePay';
    this.subscriptions.add(
      this.establishmentService.updateEstablishmentFieldWithAudit(this.establishment.uid, property, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected setBackLink(): void {
    const isInWorkflow = !this.return;

    const previousPage = this.previousRouteService.getPreviousPage();
    const previousPageWasHowManyLeavers = previousPage === this.previousQuestionPage;

    if (isInWorkflow || previousPageWasHowManyLeavers || this.inPayAndPensionsMiniFlow) {
      this.back = { url: this.previousRoute };
    } else {
      this.back = this.return;
    }

    this.backService.setBackLink(this.back);
  }

  protected addErrorLinkFunctionality(): void {
    if (!this.errorSummaryService.formEl$.value) {
      this.errorSummaryService.formEl$.next(this.formEl);
    }
  }

  private setPreviousRoute(): void {
    if (this.inPayAndPensionsMiniFlow) {
      this.previousQuestionPage = 'how-do-you-pay-for-sleep-ins';
    } else {
      this.previousQuestionPage = 'how-many-leavers';
    }
  }

  private setSkipRoute(): void {
    this.skipToQuestionPage = 'benefits-statutory-sick-pay';
    if (this.inPayAndPensionsMiniFlow && this.payAndPensionsGroup === 1) {
      this.isAtEndOfPayAndPensionsMiniFlow = true;
    }
  }

  protected onSuccess(): void {
    if (this.inPayAndPensionsMiniFlow) {
      this.submitAction = { action: 'return', save: true };
    }
  }

  public addAlert(): void {
    if (this.inPayAndPensionsMiniFlow) {
      this.alertService.addAlert({
        type: 'success',
        message: 'Workplace details added',
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
