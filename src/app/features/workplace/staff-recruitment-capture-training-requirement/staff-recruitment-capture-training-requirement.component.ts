import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-staff-recruitment-capture-training-requirement',
  templateUrl: './staff-recruitment-capture-training-requirement.component.html',
})
export class StaffRecruitmentCaptureTrainingRequirementComponent extends Question implements OnInit, OnDestroy {
  public trainingRequiredOptions = [
    {
      label: 'Yes, always',
      value: 'Yes, always',
    },
    {
      label: 'Yes, very often',
      value: 'Yes, very often',
    },
    {
      label: 'Yes, but not very often',
      value: 'Yes, but not very often',
    },
    {
      label: 'No, never',
      value: 'No, never',
    },
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.setupForm();
    this.prefill();
  }

  protected setBackLink(): void {
    // This functionality cannot be completed until routing to this page is complete
    this.backService.setBackLink({ url: ['/workplace', this.establishment.uid, 'check-answers'] });
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        trainingRequired: ['', Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    if (this.establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment) {
      this.form.patchValue({
        trainingRequired: this.establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment,
      });
    }
  }

  protected generateUpdateProps(): any {
    const trainingRequired = this.form.value;
    return trainingRequired;
  }

  protected updateEstablishment(props: any): void {
    this.subscriptions.add(
      this.establishmentService.postStaffRecruitmentData(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'accept-previous-care-certificate'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
