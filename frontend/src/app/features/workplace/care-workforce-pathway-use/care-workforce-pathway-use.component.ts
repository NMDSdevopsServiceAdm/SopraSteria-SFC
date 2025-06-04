import { Component, OnDestroy, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { CareWorkforcePathwayUseReason } from '@core/model/care-workforce-pathway.model';

@Component({
  selector: 'app-care-workforce-pathway-use',
  templateUrl: './care-workforce-pathway-use.component.html',
})
export class CareWorkforcePathwayUseComponent extends Question implements OnInit, OnDestroy {
  public section = WorkplaceFlowSections.RECRUITMENT_AND_BENEFITS;
  public cwpUseOptions = [
    { value: 'Yes', label: 'Yes, we use the pathway for one or more reasons' },
    { value: 'No', label: 'No, we do not currently use the pathway' },
    { value: "Don't know", label: 'I do not know' },
  ];
  public allReasons: Array<CareWorkforcePathwayUseReason>;

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
    this.getAllReasons();
    this.setupForm();
    this.prefill();
    this.setPreviousRoute();
    this.skipRoute = ['/workplace', this.establishment.uid, 'cash-loyalty'];
  }

  private getAllReasons() {
    this.allReasons = [
      { text: "To help define our organisation's values", id: 1, isOther: false },
      { text: 'To help update our job descriptions', id: 2, isOther: false },
      { text: 'For something else', id: 10, isOther: true },
    ];
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'care-workforce-pathway-awareness'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      use: null,
      reasons: this.formBuilder.array(this.allReasons.map((_reason) => null)),
    });

    this.allReasons
      .filter((reason) => reason.isOther)
      .forEach((otherReason) => {
        this.form.addControl(
          `otherReasonText-${otherReason.id}`,
          this.formBuilder.control(null, { updateOn: 'submit' }),
        );
      });
  }

  private prefill(): void {
    const careWorkforcePathwayUse = this.establishment.careWorkforcePathwayUse;
    if (!careWorkforcePathwayUse) {
      return;
    }

    const { use, reasons } = careWorkforcePathwayUse;
    const idsOfSelectedReasons = reasons.map((reason) => reason.id);

    const reasonCheckboxesValue = this.allReasons.map((reason) => idsOfSelectedReasons.includes(reason.id));
    const formValue = { use, reasons: reasonCheckboxesValue };

    reasons
      .filter((reason) => reason.other && reason.isOther)
      .forEach((otherReason) => {
        formValue[`otherReasonText-${otherReason.id}`] = otherReason.other;
      });

    this.form.patchValue(formValue);
  }

  public getFormControlForOtherText(reasonId: number): AbstractControl {
    return this.form.get(`otherReasonText-${reasonId}`);
  }

  protected generateUpdateProps(): any {
    return null;
  }

  // public onSubmit(): void {
  //   console.log(this.form.value, '<--- value');
  // }

  protected updateEstablishment(props: any): void {}

  protected onSuccess(): void {
    // this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'cash-loyalty'];
  }
}
