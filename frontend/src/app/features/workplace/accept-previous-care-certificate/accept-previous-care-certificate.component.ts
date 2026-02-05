import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { staffRecruitmentOptionsEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

import { WorkplaceQuestion } from '../question/question.component';

@Component({
  selector: 'app-accept-previous-care-certificate',
  templateUrl: './accept-previous-care-certificate.component.html',
  standalone: false,
})
export class AcceptPreviousCareCertificateComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  public section = WorkplaceFlowSections.RECRUITMENT_AND_BENEFITS;
  public previousCareCertificateOptions = [
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
    this.prefill();
    this.skipToQuestionPage = 'care-workforce-pathway-awareness';
  }

  private setPreviousRoute(): void {
    this.previousQuestionPage = 'staff-recruitment-capture-training-requirement';
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        acceptCareCertificatesFromPreviousEmployment: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    if (this.establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment) {
      this.form.patchValue({
        acceptCareCertificatesFromPreviousEmployment:
          this.establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment,
      });
    }
  }

  protected generateUpdateProps(): any {
    const { acceptCareCertificatesFromPreviousEmployment } = this.form.value;
    if (acceptCareCertificatesFromPreviousEmployment) {
      return { acceptCareCertificatesFromPreviousEmployment };
    }
    return null;
  }

  protected updateEstablishment(props: any): void {
    const careCertificateData = {
      property: 'wouldYouAcceptCareCertificatesFromPreviousEmployment',
      value: props.acceptCareCertificatesFromPreviousEmployment,
    };
    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, careCertificateData).subscribe(
        (data) => this._onSuccess(data.data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextQuestionPage = 'care-workforce-pathway-awareness';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
