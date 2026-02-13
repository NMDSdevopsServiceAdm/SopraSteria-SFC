import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CareWorkforcePathwayUseReason,
  UpdateCareWorkforcePathwayUsePayload,
} from '@core/model/care-workforce-pathway.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

import { PreviousRouteService } from '../../../core/services/previous-route.service';
import { Question } from '../question/question.component';

@Component({
  selector: 'app-care-workforce-pathway-use',
  templateUrl: './care-workforce-pathway-use.component.html',
  standalone: false,
})
export class CareWorkforcePathwayUseComponent extends Question implements OnInit, OnDestroy {
  public section = WorkplaceFlowSections.STAFF_DEVELOPMNENT;
  public cwpUseOptions = [
    { value: 'Yes', label: 'Yes, we use the pathway for one or more reasons' },
    { value: 'No', label: 'No, we do not currently use the pathway' },
    { value: "Don't know", label: 'I do not know' },
  ];
  public allReasons: Array<CareWorkforcePathwayUseReason> = [];
  public OtherReasonTextMaxLength = 120;
  private returnIsSetToHomePage: boolean;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
    protected alertService: AlertService,
    private previousRouteService: PreviousRouteService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.getAllReasons();
    this.setupForm();
    this.prefill();
    this.setPreviousRoute();
    this.skipRoute = ['/workplace', this.establishment.uid, 'sharing-data'];
    this.returnIsSetToHomePage = this.establishmentService.returnIsSetToHomePage();
  }

  private getAllReasons() {
    this.allReasons = this.route.snapshot.data.careWorkforcePathwayUseReasons;
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'care-workforce-pathway-awareness'];
  }

  protected setBackLink(): void {
    const isInWorkflow = !this.return;

    const previousPage = this.previousRouteService.getPreviousPage();
    const previousPageWasCWPAwareness = previousPage === 'care-workforce-pathway-awareness';

    if (isInWorkflow || previousPageWasCWPAwareness) {
      this.back = { url: this.previousRoute };
    } else {
      this.back = this.return;
    }

    this.backService.setBackLink(this.back);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      use: null,
      reasons: this.formBuilder.array(this.allReasons.map(() => null)),
    });

    this.allReasons
      .filter((reason) => reason.isOther)
      .forEach((otherReason) => {
        this.addFormControlForOtherReasonText(otherReason.id);
      });

    this.clearAllReasonsWhenSelectedNoOrDontKnow();
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Failed to update care workforce pathway usage',
      },
      {
        name: 500,
        message: 'Failed to update care workforce pathway usage',
      },
    ];
  }

  private prefill(): void {
    const careWorkforcePathwayUse = this.establishment.careWorkforcePathwayUse;
    if (!careWorkforcePathwayUse) {
      return;
    }

    const { use, reasons } = careWorkforcePathwayUse;
    this.form.patchValue({ use });

    if (use === 'Yes' && Array.isArray(reasons)) {
      this.prefillReasonsValue(reasons);
    }
  }

  private prefillReasonsValue(reasons: Array<CareWorkforcePathwayUseReason>) {
    const selectedReasonIds = reasons.map((reason) => reason.id);

    const reasonCheckboxesValue = this.allReasons.map((reason) => selectedReasonIds.includes(reason.id));
    const formValue = { reasons: reasonCheckboxesValue };

    reasons
      .filter((reason) => reason.other && reason.isOther)
      .forEach((otherReason) => {
        formValue[`otherReasonText-${otherReason.id}`] = otherReason.other;
      });

    this.form.patchValue(formValue);
  }

  private addFormControlForOtherReasonText(reasonId: number): void {
    this.form.addControl(
      `otherReasonText-${reasonId}`,
      this.formBuilder.control(null, {
        updateOn: 'submit',
        validators: [Validators.maxLength(this.OtherReasonTextMaxLength)],
      }),
    );

    this.clearOtherReasonTextWhenUnticked(reasonId);

    this.formErrorsMap.push({
      item: `otherReasonText-${reasonId}`,
      type: [
        {
          name: 'maxlength',
          message: `Reason must be ${this.OtherReasonTextMaxLength} characters or fewer`,
        },
      ],
    });
  }

  public getFormControlForOtherReasonText(reasonId: number): AbstractControl {
    return this.form.get(`otherReasonText-${reasonId}`);
  }

  private clearAllReasonsWhenSelectedNoOrDontKnow() {
    this.subscriptions.add(
      this.form.get('use').valueChanges.subscribe((newValue) => {
        if (['No', "Don't know"].includes(newValue)) {
          this.clearAllReasons();
        }
      }),
    );
  }

  private clearOtherReasonTextWhenUnticked(reasonId: number) {
    const arrayIndex = this.allReasons.findIndex((r) => r.id === reasonId);

    this.subscriptions.add(
      this.form.get(`reasons.${arrayIndex}`).valueChanges.subscribe((newValue) => {
        if (!newValue) {
          this.form.get(`otherReasonText-${reasonId}`).patchValue(null);
        }
      }),
    );
  }

  private clearAllReasons() {
    this.form.get('reasons').patchValue(this.allReasons.map(() => null));

    this.allReasons
      .filter((reason) => reason.isOther)
      .forEach((otherReason) => {
        this.getFormControlForOtherReasonText(otherReason.id).patchValue(null);
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
          const otherText = this.getFormControlForOtherReasonText(selectedReason.id).value;
          return { ...selectedReason, other: otherText };
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

  protected addAlert(): void {
    if (this.returnIsSetToHomePage) {
      this.alertService.addAlert({
        type: 'success',
        message: "Care workforce pathway information saved in 'Workplace'",
      });
    }
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'sharing-data'];
  }
}
