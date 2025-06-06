import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CareWorkforcePathwayUseReason,
  UpdateCareWorkforcePathwayUsePayload,
} from '@core/model/care-workforce-pathway.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

import { CareWorkforcePathwayService } from '../../../core/services/care-workforce-pathway.service';
import { Question } from '../question/question.component';

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
  public allReasons: Array<CareWorkforcePathwayUseReason> = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected careWorkforcePathwayService: CareWorkforcePathwayService,
    protected route: ActivatedRoute,
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
    this.allReasons = this.route.snapshot.data.careWorkforcePathwayUseReasons;
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'care-workforce-pathway-awareness'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      use: null,
      reasons: this.formBuilder.array(this.allReasons.map(() => null)),
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
    this.form.patchValue({ use });

    if (use === 'Yes' && reasons) {
      this.prefillReasonsValue(reasons);
    }
  }

  private prefillReasonsValue(reasons: Array<CareWorkforcePathwayUseReason>) {
    const idsOfSelectedReasons = reasons.map((reason) => reason.id);

    const reasonCheckboxesValue = this.allReasons.map((reason) => idsOfSelectedReasons.includes(reason.id));
    const formValue = { reasons: reasonCheckboxesValue };

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

  public handleRadioButtonClick(value: string) {
    if (['No', "Don't know"].includes(value)) {
      this.clearAllReasons();
    }
  }

  private clearAllReasons() {
    this.form.get('reasons').patchValue(this.allReasons.map(() => null));

    this.allReasons
      .filter((reason) => reason.isOther)
      .forEach((otherReason) => {
        this.getFormControlForOtherText(otherReason.id).patchValue(null);
      });
  }

  protected generateUpdateProps(): UpdateCareWorkforcePathwayUsePayload {
    const use = this.form.get('use').value;
    if (!use) {
      return null;
    }

    const reasonCheckboxes = this.form.get('reasons').value;
    const selectedReasons = this.allReasons
      .filter((_reason, index) => reasonCheckboxes[index])
      .map((selectedReason) => {
        if (selectedReason.isOther) {
          return { ...selectedReason, other: this.getFormControlForOtherText(selectedReason.id).value };
        }
        return selectedReason;
      });

    return { use, reasons: selectedReasons };
  }

  protected updateEstablishment(props: UpdateCareWorkforcePathwayUsePayload): void {
    if (!props) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService.updateCareWorkforcePathwayUse(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'cash-loyalty'];
  }
}
