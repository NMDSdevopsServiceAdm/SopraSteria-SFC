import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
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
  selector: 'app-existing-workers-health-and-care-visa',
  templateUrl: 'existing-workers-health-and-care-visa.component.html',
})
export class ExistingWorkersHealthAndCareVisa implements OnInit, OnDestroy {
  public healthCareAndVisaAnswers = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

  public form: FormGroup;
  public healthCareAndVisaWorkersList;
  public returnUrl: URLStructure = { url: ['/dashboard'] };
  public workplaceUid: string;
  public workers: Array<Worker>;
  public canViewWorker = false;
  public canEditWorker: boolean;
  private subscriptions: Subscription = new Subscription();
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;
  public hasWorkersWithHealthAndCareVisa: boolean;
  public submitted: boolean;
  public updatedWorkersHealthAndCareVisas: any = [];

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
      healthCareAndVisaRadioList: this.formBuilder.array([]),
    });
  }

  ngOnInit() {
    this.workplaceUid = this.establishmentService.establishment.uid;

    this.canViewWorker = this.permissionsService.can(this.workplaceUid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');

    this.getWorkers();
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
            console.log(workers);
            this.healthCareAndVisaWorkersList = workers;
          }),
      );
    }
  }

  public radioChange(worker, answer) {
    const updatedWorkerHealthAndCareVisa = this.healthCareAndVisaWorkersList[worker];
    this.updatedWorkersHealthAndCareVisas = this.updatedWorkersHealthAndCareVisas.filter(
      (visa) => visa.id !== updatedWorkerHealthAndCareVisa.id,
    );
    if (updatedWorkerHealthAndCareVisa.healthAndCareVisa != this.healthCareAndVisaAnswers[answer].value) {
      this.updatedWorkersHealthAndCareVisas.push({
        id: updatedWorkerHealthAndCareVisa.worker,
        uid: updatedWorkerHealthAndCareVisa.uid,
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
    this.updateHasWorkersWithHealthAndCareVisa(this.updatedWorkersHealthAndCareVisas);
    this.submitted = true;
    this.onSubmitSuccess();
    // this.establishmentService.updateWorkers(this.workplaceUid, this.updatedWorkersHealthAndCareVisas).subscribe(
    //   (response) => this.onSubmitSuccess(),
    //   (error) => this.onSubmitError(error),
    // );
  }

  public updateHasWorkersWithHealthAndCareVisa(updatedWorkersHealthAndCareVisas) {
    this.hasWorkersWithHealthAndCareVisa = updatedWorkersHealthAndCareVisas.some(
      (worker) => worker.healthAndCareVisa === 'Yes',
    );
  }

  public onSubmitSuccess() {
    if (this.hasWorkersWithHealthAndCareVisa) {
      this.router.navigate([]);
    } else {
      this.router.navigate(['dashboard'], { fragment: 'home' });
      this.alertService.addAlert({
        type: 'success',
        message: 'Health and Care Worker visa information saved',
      });
    }
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
