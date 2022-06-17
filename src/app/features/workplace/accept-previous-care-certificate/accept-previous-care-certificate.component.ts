import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { staffRecruitmentOptionsEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-accept-previous-care-certificate',
  templateUrl: './accept-previous-care-certificate.component.html',
})
export class AcceptPreviousCareCertificateComponent extends Question implements OnInit, OnDestroy {
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
    this.subscriptions.add(
      this.establishmentService.postStaffRecruitmentData(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'check-answers'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
