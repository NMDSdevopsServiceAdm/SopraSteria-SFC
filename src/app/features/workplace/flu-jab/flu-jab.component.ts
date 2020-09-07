import { OnInit, Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FluJabService, FluJabResponse, FluJabEnum } from '@core/services/flu-jab.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Router } from '@angular/router';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { Establishment } from '@core/model/establishment.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-flu-jab',
  templateUrl: './flu-jab.component.html'
})
export class FluJabComponent implements OnInit {
  private workplace: Establishment;
  private updatedFluJabs: any = [];
  public submitted: boolean;
  public fluJabAnswers = [FluJabEnum.YES, FluJabEnum.NO, FluJabEnum.DONT_KNOW];
  public fluJabs: FluJabResponse[];
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public return: URLStructure;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  constructor(
    protected formBuilder: FormBuilder,
    protected establishmentService: EstablishmentService,
    protected fluJabService: FluJabService,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected alertService: AlertService
  ) {
    this.form = this.formBuilder.group({
      fluJabsRadioList: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.return = this.establishmentService.returnTo;
    this.workplace = this.establishmentService.establishment;

    this.fluJabService.getFluJabsByWorkplace(this.workplace.uid).subscribe(
      response => this.onInitSuccess(response),
      error => this.onInitError(error)
    );

    this.submitted = false;
    this.setBackLink();
    this.setupServerErrorsMap();
  }

  setBackLink() {
    this.backService.setBackLink(this.return);
  }

  setupServerErrorsMap() {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'There has been a problem saving your workplace\'s flu vaccinations. Please try again.',
      },
      {
        name: 404,
        message: 'There has been a problem saving your workplace\'s flu vaccinations. Please try again.',
      },
      {
        name: 503,
        message: 'There has been a problem saving your workplace\'s flu vaccinations. Please try again.',
      }
    ];
  }

  get fluJabRadioList() {
    return this.form.get('fluJabsRadioList') as FormArray;
  }

  private onInitSuccess(data) {
    this.fluJabs = data;
    this.fluJabs.forEach((fluJab) => {
      this.fluJabRadioList.push(this.formBuilder.control(fluJab.fluJab));
    })
  }

  private onInitError(error) {}

  radioChange(i, j) {
    const updatedFluJab = this.fluJabs[i];
    this.updatedFluJabs = this.updatedFluJabs.filter(fluJab => fluJab.id !== updatedFluJab.id);
    if (updatedFluJab.fluJab !== this.fluJabAnswers[j]) {
      this.updatedFluJabs.push({id: updatedFluJab.id, uid: updatedFluJab.uid, fluJab: this.fluJabAnswers[j]});
    }
  }

  onSubmit() {
    this.submitted = true;
    this.establishmentService.updateWorkers(this.workplace.uid, this.updatedFluJabs).subscribe(
      response => this.onSubmitSuccess(response),
      error => this.onSubmitError(error)
    );
  }

  onSubmitSuccess(data) {
    if (this.establishmentService.establishmentId !== this.workplace.uid){
      this.router.navigate(['/workplace', this.workplace.uid], { fragment: 'staff-records' });
    } else {
      this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
    }
    this.alertService.addAlert({
      type: 'success',
      message: `You've saved who's had a flu vaccination.`,
    });
  }

  onSubmitError(error) {
    this.errorSummaryService.scrollToErrorSummary();
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
  }
}
