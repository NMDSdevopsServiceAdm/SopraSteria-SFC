import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { Job } from '@core/model/job.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
})
export class StaffDetailsComponent extends QuestionComponent implements OnInit, OnDestroy {
  public contractsAvailable = [
    { value: Contracts.Permanent, tag: 'Permanent' },
    { value: Contracts.Temporary, tag: 'Temporary' },
    { value: Contracts.Pool_Bank, tag: 'Pool, Bank' },
    { value: Contracts.Agency, tag: 'Agency' },
    { value: Contracts.Other, tag: 'Other' },
  ];
  public jobsAvailable: Job[] = [];
  public submitTitle = 'Save this staff record';
  public showInputTextforOtherRole: boolean;
  public canExit = true;
  public editFlow: boolean;
  private otherJobRoleCharacterLimit = 120;
  public isPrimaryAccount: boolean;
  public inMandatoryDetailsFlow: boolean;
  private formMainJobIdValue: number;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    public workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
    private jobService: JobService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group(
      {
        nameOrId: [null, Validators.required],
        mainJob: [null, Validators.required],
        otherJobRole: [null, [Validators.maxLength(this.otherJobRoleCharacterLimit)]],
        contract: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  init(): void {
    this.inMandatoryDetailsFlow = this.route.parent.snapshot.url[0].path === 'mandatory-details';
    this.isPrimaryAccount = this.primaryWorkplace && this.workplace.uid === this.primaryWorkplace.uid;
    this.showSaveAndCancelButton = !this.insideFlow && !this.inMandatoryDetailsFlow ? true : false;
    this.getJobs();
    this.previous = this.getReturnPath();
    this.editFlow = this.inMandatoryDetailsFlow || !this.insideFlow;
  }

  public setUpConditionalQuestionLogic(mainJobId): void {
    this.formMainJobIdValue = parseInt(mainJobId, 10);
    if (!this.insideFlow && !this.inMandatoryDetailsFlow) {
      if (this.formMainJobIdValue === 23) {
        this.conditionalQuestionUrl = [
          '/workplace',
          this.workplace.uid,
          'staff-record',
          this.worker.uid,
          'staff-record-summary',
          'registered-nurse-details',
          'nursing-category',
        ];
      } else if (this.formMainJobIdValue === 27) {
        this.conditionalQuestionUrl = [
          '/workplace',
          this.workplace.uid,
          'staff-record',
          this.worker.uid,
          'staff-record-summary',
          'mental-health-professional-summary-flow',
        ];
      } else {
        this.conditionalQuestionUrl = this.getRoutePath('staff-record-summary');
      }
    }
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'nameOrId',
        type: [
          {
            name: 'required',
            message: `Enter their name or ID number`,
          },
        ],
      },
      {
        item: 'mainJob',
        type: [
          {
            name: 'required',
            message: `Select their main job role`,
          },
        ],
      },
      {
        item: 'otherJobRole',
        type: [
          {
            name: 'maxlength',
            message: `Job role must be ${this.otherJobRoleCharacterLimit} characters or fewer `,
          },
        ],
      },
      {
        item: 'contract',
        type: [
          {
            name: 'required',
            message: `Select the type of contract they have`,
          },
        ],
      },
    ];
  }

  getJobs() {
    this.subscriptions.add(
      this.jobService.getJobs().subscribe((jobs) => {
        if (this.worker && this.worker.otherJobs && this.worker.otherJobs.jobs) {
          this.worker.otherJobs.jobs.map((otherjob) => {
            jobs = jobs.filter((j) => j.id !== otherjob.jobId);
          });
        }
        this.jobsAvailable = jobs;
        if (this.worker) {
          this.renderInEditMode();
        }
      }),
    );
  }

  generateUpdateProps() {
    const { nameOrId, contract, mainJob, otherJobRole } = this.form.controls;

    const props = {
      nameOrId: nameOrId.value,
      contract: contract.value,
      mainJob: {
        jobId: parseInt(mainJob.value, 10),
        ...(otherJobRole.value && { other: otherJobRole.value }),
      },
    };

    if (this.worker && parseInt(mainJob.value, 10) !== 23) {
      this.worker.registeredNurse = null;
      if (this.worker.nurseSpecialism) {
        this.worker.nurseSpecialism.specialism = null;
      }
    }
    return props;
  }

  selectedJobRole(id: number) {
    this.setUpConditionalQuestionLogic(id);
    this.showInputTextforOtherRole = false;
    const otherJob = this.jobsAvailable.find((job) => job.id === +id);
    if (otherJob && otherJob.other) {
      this.showInputTextforOtherRole = true;
    }
  }

  renderInEditMode(): void {
    this.form.patchValue({
      nameOrId: this.worker.nameOrId,
      mainJob: this.worker.mainJob.jobId,
      otherJobRole: this.worker.mainJob.other,
      contract: this.worker.contract,
    });

    this.selectedJobRole(this.worker.mainJob.jobId);
  }

  private getReturnPath() {
    if (this.inMandatoryDetailsFlow) {
      this.returnUrl = this.getRoutePath('mandatory-details');
      return this.returnUrl;
    }
    if (this.insideFlow) {
      return this.workplace?.uid === this.primaryWorkplace?.uid ? ['/dashboard'] : [`/workplace/${this.workplace.uid}`];
    }
    return this.getRoutePath('');
  }

  protected onSuccess(): void {
    this.next = this.getRoutePath('mandatory-details');
    !this.editFlow && this.workerService.setAddStaffRecordInProgress(true);
  }

  protected addAlert(): void {
    !this.editFlow &&
      this.alertService.addAlert({
        type: 'success',
        message: 'Staff record saved',
      });
  }
}
