import { Component } from '@angular/core';
import { FormBuilder, FormArray } from '@angular/forms';
import { FluJabService } from '@core/services/flu-jab.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AlertService } from '@core/services/alert.service';
import { Question } from '../question/question.component';

@Component({
  selector: 'app-flu-jab',
  templateUrl: './flu-jab.component.html',
})
export class FluJabComponent extends Question {
  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected fluJabService: FluJabService,
    protected alertService: AlertService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      fluJabs: this.formBuilder.array([]),
    });
  }

  protected init(): void {
    this.return = this.establishmentService.returnTo;

    this.fluJabService
      .getFluJabsByWorkplace(this.establishment.uid)
      .subscribe((response) => this.onInitSuccess(response));
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: "There has been a problem saving your workplace's flu vaccinations. Please try again.",
      },
      {
        name: 404,
        message: "There has been a problem saving your workplace's flu vaccinations. Please try again.",
      },
      {
        name: 503,
        message: "There has been a problem saving your workplace's flu vaccinations. Please try again.",
      },
    ];
  }

  get fluJabsArray() {
    return this.form.get('fluJabs') as FormArray;
  }

  private onInitSuccess(response) {
    response.forEach((fluJab) => {
      this.fluJabsArray.push(this.formBuilder.group(fluJab));
    });
  }

  protected generateUpdateProps() {
    return this.fluJabsArray.value.map((item) => {
      return { uid: item.uid, fluJab: item.fluJab };
    });
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService.updateWorkers(this.establishment.uid, props).subscribe(
        (data) => {
          this._onSuccess(data);
          this.addAlert();
        },
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess() {
    this.submitAction.action = 'return';
    this.return.fragment = 'staff-records';
  }

  private addAlert() {
    this.alertService.addAlert({
      type: 'success',
      message: 'You\'ve saved who\'s had a flu vaccination.',
    });
  }
}
