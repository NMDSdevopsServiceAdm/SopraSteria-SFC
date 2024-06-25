import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { URLStructure } from '@core/model/url.model';
import { take } from 'rxjs/operators';
import { Worker } from '@core/model/worker.model';
import { Subscription } from 'rxjs';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-health-and-care-visa-existing-workers',
  templateUrl: 'health-and-care-visa-existing-workers.component.html',
})
export class HealthAndCareVisaExistingWorkers implements OnInit, OnDestroy {
  public healthCareAndVisaAnswers = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

  public headerText;

  public form: FormGroup;
  public healthCareAndVisaWorkersList;
  public returnUrl: URLStructure = { url: ['/dashboard'] };
  public workplaceUid: string;
  public workers: any = [];
  public canViewWorker = false;
  public canEditWorker: boolean;
  private subscriptions: Subscription = new Subscription();
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;
  public hasWorkersWithHealthAndCareVisa: boolean;
  public submitted: boolean;
  public updatedWorkers: any = [];
  public workersHealthAndCareVisaAnswersToSave = [];
  formGroupRow: any;
  @ViewChild('formEl') formEl: ElementRef;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private backLinkService: BackLinkService,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private internationalRecruitmentService: InternationalRecruitmentService,
    private alertService: AlertService,
  ) {
    this.form = this.formBuilder.group({
      healthAndCareVisaRadioList: this.formBuilder.group({}),
    });

  }

  ngOnInit() {
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.canViewWorker = this.permissionsService.can(this.workplaceUid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.getWorkers();
    this.setPluralisation();
    this.setBackLink();
  }

  get healthAndCareVisaRadioList() {
    return this.form.get('healthAndCareVisaRadioList') as FormGroup;
  }

  get healthAndCareVisaRadioListValues() {
    return Object.values(this.healthAndCareVisaRadioList.controls);
  }

  initialiseForm(): void {
    for(let i = 0; i < this.workers.length; i++) {
      this.healthAndCareVisaRadioList.addControl(this.workers[i].uid, this.createFormGroupForWorker());
    }
  }

  private createFormGroupForWorker(): FormGroup {
    return this.formBuilder.group({
      healthAndCareVisa: null,
    });
  }


  setupServerErrorsMap() {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'There has been a problem saving . Please try again.',
      },
      {
        name: 404,
        message: 'There has been a problem saving. Please try again.',
      },
      {
        name: 503,
        message: 'There has been a problem saving. Please try again.',
      },
    ];
  }

  private getWorkers(): void {
    if (this.canEditWorker) {
      this.subscriptions.add(
        this.internationalRecruitmentService
          .getAllWorkersNationalityAndBritishCitizenship(this.workplaceUid)
          .pipe(take(1))
          .subscribe(({ workers }) => {
            this.workers = workers;
            this.initialiseForm();
            this.prefillForm();
          }),
      );
    }
  }

  prefillForm(): void {
    const updatedWorkersResponse = this.internationalRecruitmentService.getInternationalRecruitmentWorkerAnswers();
    if(updatedWorkersResponse?.healthAndCareVisaWorkerAnswers) {
      this.updatedWorkers = updatedWorkersResponse.healthAndCareVisaWorkerAnswers;
    }

    if(this.updatedWorkers) {
      for(let worker of this.updatedWorkers) {
        this.healthAndCareVisaRadioList.controls[worker.uid].setValue({ healthAndCareVisa: worker.healthAndCareVisa });
      }
    }
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setPluralisation(): void {
    if (this.workers?.length === 1) {
      this.headerText = 'Is this worker on a Health and Care Worker visa?';
    } else {
      this.headerText = 'Are these workers on Health and Care Worker visas?';
    }
  }

  public radioChange(worker, answer) {
    const updatedWorkerHealthAndCareVisa = this.workers[worker];

    this.updatedWorkers = this.updatedWorkers.filter(
      (updateWorker) => updateWorker.uid !== updatedWorkerHealthAndCareVisa.uid,
    );

    if (updatedWorkerHealthAndCareVisa.healthAndCareVisa != this.healthCareAndVisaAnswers[answer].value) {
      this.workersHealthAndCareVisaAnswersToSave.push({
        uid: updatedWorkerHealthAndCareVisa.uid,
        healthAndCareVisa: this.healthCareAndVisaAnswers[answer].value,
      });

      this.updatedWorkers.push({
        ...updatedWorkerHealthAndCareVisa,
        healthAndCareVisa: this.healthCareAndVisaAnswers[answer].value,
      });
    }
  }

  public getWorkerRecordPath(event: Event, worker: Worker) {
    event.preventDefault();
    const path = ['/workplace', this.workplaceUid, 'staff-record', worker.uid, 'staff-record-summary'];
    this.router.navigate(path);
  }

  public onSubmit(): void {
    this.updateHasWorkersWithHealthAndCareVisa(this.updatedWorkers);
    this.submitted = true;

    if(this.updatedWorkers.length === 0) {
      this.navigateToHome();
      return;
    }

    if (this.hasWorkersWithHealthAndCareVisa) {
      this.internationalRecruitmentService.setInternationalRecruitmentWorkerAnswers({
        workplaceUid: this.workplaceUid,
        healthAndCareVisaWorkerAnswers: this.updatedWorkers,
      });
      this.navigateToEmployedFromOutsideOrInsideUk();
    } else {
      this.establishmentService.updateWorkers(this.workplaceUid, this.workersHealthAndCareVisaAnswersToSave).subscribe(
        (response) => this.navigateToHomeWithSuccessAlert(),
        (error) => this.onSubmitError(error),
      );
    }
  }

  public updateHasWorkersWithHealthAndCareVisa(updatedWorkers) {
    console.log(updatedWorkers);
    this.hasWorkersWithHealthAndCareVisa = updatedWorkers.some((worker) => worker.healthAndCareVisa === 'Yes');
  }

  public navigateToHome(): void {
    this.router.navigate(['dashboard'], { fragment: 'home' });
  }

  public navigateToHomeWithSuccessAlert(): void {
    this.navigateToHome();
    this.alertService.addAlert({
      type: 'success',
      message: 'Health and Care Worker visa information saved',
    });
  }

  public navigateToEmployedFromOutsideOrInsideUk(): void {
    this.router.navigate(['workplace', this.workplaceUid, 'employed-from-outside-or-inside-uk']);
  }

  onSubmitError(error) {
    this.errorSummaryService.scrollToErrorSummary();
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
  }

  public navigateToStaffRecords(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
