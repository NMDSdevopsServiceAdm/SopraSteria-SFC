import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataSharingOptions } from '@core/model/data-sharing.model';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TotalStaffFormService } from '@core/services/total-staff-form.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-total-staff-question',
  templateUrl: './total-staff-question.component.html',
})
export class TotalStaffQuestionComponent extends Question implements OnInit, OnDestroy {
  public nextRoute: string[];
  public workplace: Establishment;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService, 
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected totalStaffFormService: TotalStaffFormService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
    this.form = totalStaffFormService.createForm(formBuilder);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = this.totalStaffFormService.createFormErrorsMap();
  }

  protected init(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'vacancies'];
    this.setPreviousRoute();

    this.setupFormErrorsMap();
  }

  private setPreviousRoute(): void {
    this.previousRoute = this.establishment.share.with.includes(DataSharingOptions.LOCAL)
      ? ['/workplace', `${this.establishment.uid}`, 'sharing-data-with-local-authorities']
      : ['/workplace', `${this.establishment.uid}`, 'sharing-data'];
  }

  protected generateUpdateProps() {
    return {
      totalStaff: this.form.value.totalStaff,
    };
  }

  protected updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService.postStaff(this.establishment.uid, props.totalStaff).subscribe(
        data => this._onSuccess(data),
        error => this.onError(error)
      )
    );
  }
}
