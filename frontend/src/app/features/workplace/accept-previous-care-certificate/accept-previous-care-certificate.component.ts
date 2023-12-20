import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
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
  public section: string;
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

  public inStaffRecruitmentFlow: boolean;

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
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'cash-loyalty'];
    this.section = this.inStaffRecruitmentFlow ? 'Care Certificates' : 'Recruitment';
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'staff-recruitment-capture-training-requirement'];
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
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'cash-loyalty'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
