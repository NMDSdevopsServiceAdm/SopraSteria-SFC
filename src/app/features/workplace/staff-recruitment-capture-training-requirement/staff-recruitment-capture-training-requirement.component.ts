import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { staffRecruitmentOptionsEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { take, tap } from 'rxjs/operators';

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
    this.setPreviousRoute();
    this.getInStaffRecruitmentFlow();
    this.prefill();
  }

  private getInStaffRecruitmentFlow() {
    this.subscriptions.add(
      this.establishmentService.inStaffRecruitmentFlow$.pipe(take(1)).subscribe((inFlow) => {
        this.inStaffRecruitmentFlow = inFlow;
      }),
    );
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
    this.subscriptions.add(
      this.establishmentService.postStaffRecruitmentData(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected updateEstablishmentService(): void {
    this.establishmentService
      .getEstablishment(this.establishmentService.establishmentId)
      .pipe(
        tap((workplace) => {
          return (
            this.establishmentService.setWorkplace(workplace), this.establishmentService.setPrimaryWorkplace(workplace)
          );
        }),
      )
      .subscribe();
  }

  protected onSuccess(): void {
    this.updateEstablishmentService();
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'accept-previous-care-certificate'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
