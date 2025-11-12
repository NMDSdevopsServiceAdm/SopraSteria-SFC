import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-health-and-care-visa-existing-workers',
    templateUrl: 'health-and-care-visa-existing-workers.component.html',
    standalone: false
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
  public returnUrl: URLStructure = { url: ['/dashboard'], fragment: 'home' };
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
  @ViewChild('formEl') formEl: ElementRef;
  public isFromOutsideOrInsideUKPage: boolean;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private internationalRecruitmentService: InternationalRecruitmentService,
    private alertService: AlertService,
    private previousRouteService: PreviousRouteService,
  ) {
    this.form = this.formBuilder.group({
      healthAndCareVisaRadioList: this.formBuilder.group({}),
    });
  }

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.canViewWorker = this.permissionsService.can(this.workplaceUid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.getWorkers();
    this.setBackLink();
  }

  get healthAndCareVisaRadioList(): FormGroup {
    return this.form.get('healthAndCareVisaRadioList') as FormGroup;
  }

  get healthAndCareVisaRadioListValues(): AbstractControl[] {
    return Object.values(this.healthAndCareVisaRadioList.controls);
  }

  public checkPreviousRoute(): boolean {
    const previousPageUrl = this.previousRouteService.getPreviousUrl();
    if (previousPageUrl.includes('employed-from-outside-or-inside-uk')) {
      return true;
    }
    return false;
  }

  initialiseForm(): void {
    for (let i = 0; i < this.workers.length; i++) {
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
            this.setPluralisation();
            this.initialiseForm();
            this.prefillForm();
          }),
      );
    }
  }

  prefillForm(): void {
    this.isFromOutsideOrInsideUKPage = this.checkPreviousRoute();
    if (this.isFromOutsideOrInsideUKPage) {
      const updatedWorkersResponse = this.internationalRecruitmentService.getInternationalRecruitmentWorkerAnswers();

      if (
        updatedWorkersResponse?.workplaceUid === this.workplaceUid &&
        updatedWorkersResponse?.healthAndCareVisaWorkerAnswers
      ) {
        this.updatedWorkers = updatedWorkersResponse.healthAndCareVisaWorkerAnswers;

        for (let worker of this.updatedWorkers) {
          if (this.healthAndCareVisaRadioList.controls[worker.uid]) {
            this.healthAndCareVisaRadioList.controls[worker.uid].setValue({
              healthAndCareVisa: worker.healthAndCareVisa,
            });
          }
        }
      }
    }
  }

  private setBackLink(): void {
    this.backService.setBackLink(this.returnUrl);
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

  public navigateToStaffRecordSummary(event: Event, workerUid: Worker) {
    event.preventDefault();
    const path = ['/workplace', this.workplaceUid, 'staff-record', workerUid, 'staff-record-summary'];
    this.router.navigate(path);
  }

  public onSubmit(): void {
    this.updateHasWorkersWithHealthAndCareVisa(this.updatedWorkers);
    this.submitted = true;

    if (this.updatedWorkers.length === 0) {
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
        () => this.navigateToHomeWithSuccessAlert(),
        (error) => this.onSubmitError(error),
      );
    }
  }

  public updateHasWorkersWithHealthAndCareVisa(updatedWorkers): void {
    this.hasWorkersWithHealthAndCareVisa = updatedWorkers.some((worker) => worker.healthAndCareVisa === 'Yes');
  }

  public navigateToHome(): void {
    this.router.navigate(['dashboard'], { fragment: 'home' });
  }

  public navigateToHomeWithSuccessAlert(): void {
    this.router.navigate(['dashboard'], { fragment: 'home' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Health and Care Worker visa information saved',
      });
    });
  }

  public navigateToEmployedFromOutsideOrInsideUk(): void {
    this.router.navigate(['workplace', this.workplaceUid, 'employed-from-outside-or-inside-uk']);
  }

  onSubmitError(error): void {
    this.errorSummaryService.scrollToErrorSummary();
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
  }

  public navigateToStaffRecords(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }

  ngOnDestroy(): void {
    if (!this.submitted) {
      this.internationalRecruitmentService.setInternationalRecruitmentWorkerAnswers(null);
    }
    this.subscriptions.unsubscribe();
  }
}
