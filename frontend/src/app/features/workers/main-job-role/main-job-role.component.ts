import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from '@core/model/job.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { NewWorkerMandatoryInfo, WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-main-job-role.component',
  templateUrl: './main-job-role.component.html',
})
export class MainJobRoleComponent extends QuestionComponent implements OnInit, OnDestroy {
  public jobsAvailable: Job[] = [];
  public jobGroups = [];
  public preFilledId: number;
  public canExit = true;
  public editFlow: boolean;
  public inMandatoryDetailsFlow: boolean;
  public summaryContinue: boolean;
  public callToActionLabel: string = 'Save and return';
  private isAddingNewWorker: boolean;
  private newWorkerMandantoryInfo: NewWorkerMandatoryInfo;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    public workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group(
      {
        mainJob: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  init(): void {
    this.inMandatoryDetailsFlow = this.route.parent.snapshot.url[0].path === 'mandatory-details';
    this.summaryContinue = !this.insideFlow && !this.inMandatoryDetailsFlow;
    this.editFlow = this.inMandatoryDetailsFlow || this.wdfEditPageFlag || !this.insideFlow;
    this.isAddingNewWorker = !this.worker;

    this.getJobs();
    this.getReturnPath();

    if (this.editFlow) {
      this.prefillForm();
    }

    if (this.isAddingNewWorker) {
      this.callToActionLabel = 'Save this staff record';
      this.newWorkerMandantoryInfo = this.workerService.newWorkerMandatoryInfo;
    }
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  private prefillForm(): void {
    const savedMainJob = this.worker.mainJob;
    if (savedMainJob) {
      this.form.setValue({ mainJob: savedMainJob.jobId });
      this.preFilledId = savedMainJob.jobId;
      this.form.get('mainJob').updateValueAndValidity();
    }
  }

  generateUpdateProps() {
    const { mainJob } = this.form.controls;

    let props = {
      mainJob: {
        jobId: mainJob.value,
      },
    };

    if (this.isAddingNewWorker) {
      props = { ...props, ...this.newWorkerMandantoryInfo };
    }

    if (this.worker && mainJob.value !== 23) {
      this.worker.registeredNurse = null;
      if (this.worker.nurseSpecialism) {
        this.worker.nurseSpecialism.specialism = null;
      }
    }
    return props;
  }

  private getReturnPath() {
    if (this.inMandatoryDetailsFlow) {
      this.returnUrl = this.getRoutePath('mandatory-details');
      return;
    }
  }

  private determineConditionalRouting(): string[] {
    const nextRoute = this.determineBaseRoute();
    if (this.workerService.hasJobRole(this.worker, 27)) {
      nextRoute.push('mental-health-professional');
    } else if (this.workerService.hasJobRole(this.worker, 23)) {
      nextRoute.push('nursing-category');
    }
    return nextRoute;
  }

  protected onSuccess(): void {
    if (this.editFlow) {
      this.next = this.determineConditionalRouting();
    } else {
      this.next = this.getRoutePath('mandatory-details');
      this.workerService.setAddStaffRecordInProgress(true);
    }
  }

  protected addAlert(): void {
    !this.editFlow &&
      this.alertService.addAlert({
        type: 'success',
        message: 'Staff record saved',
      });
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'mainJob',
        type: [
          {
            name: 'required',
            message: 'Select the job role',
          },
        ],
      },
    ];
  }

  public onSubmit(): void {
    this.workerService.clearNewWorkerMandatoryInfo();
    super.onSubmit();
  }
}
