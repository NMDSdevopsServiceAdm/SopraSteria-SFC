import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { JobRole } from '@core/model/job.model';
import {
  DelegatedHealthcareActivitiesService,
  DHAGetAllWorkersResponse,
} from '@core/services/delegated-healthcare-activities.service';
import { take } from 'rxjs/operators';
import {
  DelegatedHealthcareActivity,
  StaffWhatKindDelegatedHealthcareActivities,
} from '@core/model/delegated-healthcare-activities.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-who-carry-out-delegated-healthcare-activities',
  templateUrl: './who-carry-out-delegated-healthcare-activities.component.html',
})
export class WhoCarryOutDelegatedHealthcareActivitiesComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private workplaceUid: string;
  public workersToShow: Array<{ uid: string; nameOrId: string; mainJob: JobRole }> = [];
  public workerAnswers: Array<{ uid: string; carryOutDelegatedHealthcareActivities?: string }> = [];
  public dhaDefinition: string;
  public workerCount: number;
  public itemsPerPage: number = 15;
  public pageIndex: number = 0;
  public submitted: boolean;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  @ViewChild('formEl') formEl: ElementRef;
  public section = 'Employment details';
  public heading = 'Who carries out delegated healthcare activities?';
  public allDelegatedHealthcareActivities: Array<DelegatedHealthcareActivity>;
  public staffWhatKindDelegatedHealthcareActivities: StaffWhatKindDelegatedHealthcareActivities;

  public avalibleAnswers = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private establishmentService: EstablishmentService,
    private backLinkService: BackLinkService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private alertService: AlertService,
    private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService,
    private route: ActivatedRoute,
  ) {
    this.form = this.formBuilder.group({
      delegatedHealthCareRadioList: this.formBuilder.group({}),
    });
  }

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.handleGetWorkersResponse(this.route.snapshot.data.workerWhoRequireDHAAnswer);

    this.dhaDefinition = this.delegatedHealthcareActivitiesService.dhaDefinition;
    this.allDelegatedHealthcareActivities = this.route.snapshot.data?.delegatedHealthcareActivities;
    this.staffWhatKindDelegatedHealthcareActivities =
      this.establishmentService.establishment.staffWhatKindDelegatedHealthcareActivities;
    this.initialiseForm();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private getWorkers(): void {
    const queryParams = { pageIndex: this.pageIndex, itemsPerPage: this.itemsPerPage };

    this.subscriptions.add(
      this.delegatedHealthcareActivitiesService
        .getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(this.workplaceUid, queryParams)
        .pipe(take(1))
        .subscribe((response) => this.handleGetWorkersResponse(response)),
    );
  }

  private handleGetWorkersResponse(response: DHAGetAllWorkersResponse): void {
    if (response?.workers?.length) {
      this.workersToShow = response.workers;
      this.workerCount = response?.workerCount;
    }
  }

  get delegatedHealthCareRadioList(): FormGroup {
    return this.form.get('delegatedHealthCareRadioList') as FormGroup;
  }

  get delegatedHealthCareRadioListValues(): AbstractControl[] {
    return Object.values(this.delegatedHealthCareRadioList.controls);
  }

  initialiseForm(): void {
    for (let i = 0; i < this.workersToShow.length; i++) {
      this.delegatedHealthCareRadioList.addControl(this.workersToShow[i].uid, this.createFormGroupForWorker());
    }
  }

  private createFormGroupForWorker(): FormGroup {
    return this.formBuilder.group({
      delegatedHealthcare: null,
    });
  }

  public onSubmit(): void {
    this.submitted = true;

    this.establishmentService.updateWorkers(this.workplaceUid, this.workerAnswers).subscribe(
      () => this.onSubmitSuccess(),
      (error) => this.onSubmitError(error),
    );
  }

  private onSubmitSuccess(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Delegated healthcare activity information saved',
      });
    });
  }

  private setupServerErrorsMap(): void {
    const serverErrorMessage =
      'There has been a problem saving your delegated healthcare activities. Please try again.';
    this.serverErrorsMap = [400, 404, 503].map((errorCode) => {
      return {
        name: errorCode,
        message: serverErrorMessage,
      };
    });
  }

  public radioChange(workerIndex, answerIndex): void {
    const updatedWorker = this.workersToShow[workerIndex];
    const updatedWorkerWithAnswer = this.workerAnswers.find((worker) => {
      return worker.uid === updatedWorker.uid;
    });

    if (updatedWorkerWithAnswer) {
      updatedWorkerWithAnswer.carryOutDelegatedHealthcareActivities = this.avalibleAnswers[answerIndex].value;
    } else {
      this.workerAnswers.push({
        uid: updatedWorker.uid,
        carryOutDelegatedHealthcareActivities: this.avalibleAnswers[answerIndex].value,
      });
    }
  }
  private onSubmitError(error): void {
    this.errorSummaryService.scrollToErrorSummary();
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
  }

  public handlePageUpdate(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.getWorkers();
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
