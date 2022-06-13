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

  public emptyForm = true;

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

    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'accept-previous-care-certificate'];
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'number-of-people-interviewed'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        trainingRequired: ['', Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  protected generateUpdateProps() {
    const { trainingRequired } = this.form.value;
    return trainingRequired;
  }

  protected updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService
        .postStaffRecruitmentData(this.establishment.uid, {
          staffRecruitmentColumn: 'doNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
          staffRecruitmentData: props,
        })
        .subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
