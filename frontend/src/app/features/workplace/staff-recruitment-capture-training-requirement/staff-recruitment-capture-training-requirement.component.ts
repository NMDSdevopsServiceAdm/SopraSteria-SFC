import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { staffRecruitmentOptionsEnum } from '@core/model/establishment.model';
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
      value: staffRecruitmentOptionsEnum.ALWAYS,
    },
    {
      label: 'Yes, very often',
      value: staffRecruitmentOptionsEnum.VERY_OFTEN,
    },
    {
      label: 'Yes, but not very often',
      value: staffRecruitmentOptionsEnum.NOT_OFTEN,
    },
    {
      label: 'No, never',
      value: staffRecruitmentOptionsEnum.NEVER,
    },
  ];

  public inStaffRecruitmentFlow: boolean;
  public section: string;

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
    this.setupForm();
    this.setPreviousRoute();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;
    this.prefill();
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'accept-previous-care-certificate'];
    this.section = this.inStaffRecruitmentFlow ? 'Training' : 'Recruitment';
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'number-of-interviews'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        trainingRequired: null,
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
    const { trainingRequired } = this.form.value;
    if (trainingRequired) {
      return { trainingRequired };
    }
    return null;
  }

  protected updateEstablishment(props: any): void {
    const trainingRequirementData = {
      property: 'doNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
      value: props.trainingRequired,
    };
    this.subscriptions.add(
      this.establishmentService
        .updateSingleEstablishmentField(this.establishment.uid, trainingRequirementData)
        .subscribe(
          (data) => this._onSuccess(data.data),
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
