import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TotalStaffFormService } from '@core/services/total-staff-form.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-total-staff-question',
  templateUrl: './total-staff-question.component.html',
})
export class TotalStaffQuestionComponent extends Question {
  public nextRoute: string[];
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];

  constructor(
    public errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected establishmentService: EstablishmentService,
    private totalStaffFormService: TotalStaffFormService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
    this.form = totalStaffFormService.createForm(formBuilder, true);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = this.totalStaffFormService.createFormErrorsMap();
    if (this.establishment.isParent) {
      this.formErrorsMap[0].type.find((error) => {
        error.name === 'required' && (error.message = 'Enter how many members of staff your workplace has');
      });
    }
  }

  protected init(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'vacancies'];
    this.setPreviousRoute();

    this.setupFormErrorsMap();
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'sharing-data'];
  }

  protected generateUpdateProps() {
    return {
      totalStaff: this.form.value.totalStaff,
    };
  }

  protected updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService.postStaff(this.establishment.uid, props.totalStaff).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }
}
