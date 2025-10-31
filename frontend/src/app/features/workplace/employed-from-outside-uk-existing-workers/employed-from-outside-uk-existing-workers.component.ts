import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-employed-from-outside-uk-existing-workers',
    templateUrl: './employed-from-outside-uk-existing-workers.component.html',
    standalone: false
})
export class EmployedFromOutsideUkExistingWorkersComponent implements OnInit {
  public workplaceUid: string;
  public submitted: boolean;
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  public return: URLStructure = { url: ['/dashboard'], fragment: 'home' };
  public workersWithHealthAndCareVisas: Array<any>;
  public workersWhichDontHaveHealthAndCareVisas: Array<any>;
  public answers: any;
  private existingStaffHealthAndCareVisaUrl: Array<string>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private alertService: AlertService,
    private internationalRecruitmentService: InternationalRecruitmentService,
    private backService: BackService,
  ) {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.submitted = false;
    this.existingStaffHealthAndCareVisaUrl = ['/workplace', this.workplaceUid, 'health-and-care-visa-existing-workers'];
    this.setBackLink();

    this.answers = this.internationalRecruitmentService.getEmployedFromOutsideUkAnswers();

    const allWorkers = this.getInternationalRecruitmentWorkers();

    if (!allWorkers) {
      this.router.navigate(this.existingStaffHealthAndCareVisaUrl);
      return;
    }

    this.workersWithHealthAndCareVisas = allWorkers.workersWithHealthAndCareVisas;
    this.workersWhichDontHaveHealthAndCareVisas = allWorkers.workersWhichDontHaveHealthAndCareVisas;

    this.setUpFormData();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get workers(): FormArray {
    return this.form.get('workers') as FormArray;
  }

  private getInternationalRecruitmentWorkers(): any {
    const internationalRecruitmentWorkerAnswers =
      this.internationalRecruitmentService.getInternationalRecruitmentWorkerAnswers();

    if (internationalRecruitmentWorkerAnswers?.workplaceUid !== this.workplaceUid) {
      return null;
    }
    const workersWithHealthAndCareVisas = internationalRecruitmentWorkerAnswers.healthAndCareVisaWorkerAnswers.filter(
      (worker) => worker.healthAndCareVisa === 'Yes',
    );
    const workersWhichDontHaveHealthAndCareVisas =
      internationalRecruitmentWorkerAnswers.healthAndCareVisaWorkerAnswers.filter(
        (worker) => worker.healthAndCareVisa !== 'Yes',
      );

    if (!workersWithHealthAndCareVisas.length) return null;

    return { workersWithHealthAndCareVisas, workersWhichDontHaveHealthAndCareVisas };
  }

  public onSubmit(): void {
    this.submitted = true;

    this.establishmentService.updateWorkers(this.workplaceUid, this.workersWithUpdatedFields()).subscribe(
      () => this.onSubmitSuccess(),
      (error) => this.onSubmitError(error),
    );
  }

  private workersWithUpdatedFields(): Array<any> {
    return [...this.workersWithHealthAndCareVisas, ...this.workersWhichDontHaveHealthAndCareVisas].map((worker) => {
      return {
        ...(worker.employedFromOutsideUk !== null ? { employedFromOutsideUk: worker.employedFromOutsideUk } : {}),
        healthAndCareVisa: worker.healthAndCareVisa,
        uid: worker.uid,
      };
    });
  }

  private setUpFormData(): void {
    this.workersWithHealthAndCareVisas.forEach(() => {
      this.workers.push(this.createFormGroupForWorker());
    });
  }

  private createFormGroupForWorker(): FormGroup {
    return this.formBuilder.group({
      insideOrOutsideUk: null,
    });
  }

  private setupServerErrorsMap(): void {
    const serverErrorMessage = 'There has been a problem saving your Health and Care visa data. Please try again.';
    this.serverErrorsMap = [400, 404, 503].map((errorCode) => {
      return {
        name: errorCode,
        message: serverErrorMessage,
      };
    });
  }

  public navigateToStaffRecord(event: Event, worker): void {
    event.preventDefault();
    this.router.navigate(['/workplace', this.workplaceUid, 'staff-record', worker.uid, 'staff-record-summary']);
  }

  private onSubmitSuccess(): void {
    this.internationalRecruitmentService.setInternationalRecruitmentWorkerAnswers(null);
    this.router.navigate(['/dashboard'], { fragment: 'home' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Health and Care  Worker visa information saved',
      });
    });
  }

  public radioChange(workerIndex, answerIndex): void {
    const updatedWorker = this.workersWithHealthAndCareVisas[workerIndex];
    updatedWorker.employedFromOutsideUk = this.answers[answerIndex].value;
  }

  private onSubmitError(error): void {
    this.errorSummaryService.scrollToErrorSummary();
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: this.existingStaffHealthAndCareVisaUrl });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
