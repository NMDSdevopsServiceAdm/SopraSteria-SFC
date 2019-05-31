import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Contracts } from '@core/model/contracts.enum';
import { Job } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { JobService } from '@core/services/job.service';
import { WorkerService } from '@core/services/worker.service';
import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
})
export class StaffDetailsComponent extends QuestionComponent implements OnInit, OnDestroy {
  private jobRoleCharacterLimit = 120;

  public contractsAvailable: Array<string> = [];
  public jobsAvailable: Job[] = [];
  public showInputTextforOtherRole: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    private jobService: JobService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      nameOrId: [null, Validators.required],
      mainJob: [null, Validators.required],
      jobRole: [null, [Validators.maxLength(this.jobRoleCharacterLimit)]],
      contract: [null, Validators.required],
    });
  }

  init(): void {
    this.contractsAvailable = Object.values(Contracts);
    // this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobsAvailable = jobs)));

    // TOD0: rough mock...
    this.subscriptions.add(
      this.jobService.getJobs().subscribe(jobs => {
        this.jobsAvailable = [
          {
            id: 18,
            title: 'Occupational Therapist',
          },
          {
            id: 19,
            title: 'Occupational Therapist Assistant',
          },
          {
            id: 20,
            title: 'Other job roles directly involved in providing care',
            other: true,
          },
          {
            id: 21,
            title: 'Other job roles not directly involved in providing care',
            other: true,
          },
        ] as Job[];
      })
    );

    this.previous = ['/worker', 'start-screen'];

    if (this.worker) {
      this.form.patchValue({
        nameOrId: this.worker.nameOrId,
        mainJob: this.worker.mainJob.jobId,
        jobRole: this.worker.mainJob.other,
        contract: this.worker.contract,
      });

      this.previous = ['/dashboard'];
    }
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'nameOrId',
        type: [
          {
            name: 'required',
            message: `Full name or ID number is required.`,
          },
        ],
      },
      {
        item: 'mainJob',
        type: [
          {
            name: 'required',
            message: `Main job role is required.`,
          },
        ],
      },
      {
        item: 'jobRole',
        type: [
          {
            name: 'maxlength',
            message: `Character limit of ${this.jobRoleCharacterLimit} exceeded.`,
          },
        ],
      },
      {
        item: 'contract',
        type: [
          {
            name: 'required',
            message: `Type of contract is required.`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { nameOrId, contract, mainJob, jobRole } = this.form.controls;

    const props = {
      nameOrId: nameOrId.value,
      contract: contract.value,
      mainJob: {
        jobId: parseInt(mainJob.value, 10),
        ...((jobRole.value) && {other: jobRole.value})
      }
    };

    // TODO: Removing Other Jobs should be handled by the Server
    // https://trello.com/c/x3N7dQJP
    if (this.worker && this.worker.otherJobs) {
      (props as any).otherJobs = this.worker.otherJobs.filter(j => j.jobId !== parseInt(mainJob.value, 10));
    }

    return props;
  }

  onSuccess() {
    this.next =
      this.worker.mainJob.jobId === 27
        ? ['/worker', this.worker.uid, 'mental-health-professional']
        : ['/worker', this.worker.uid, 'main-job-start-date'];
  }

  onChangeJobRole(id: number) {
    this.showInputTextforOtherRole = false;
    const job = this.getJob({ jobs: this.jobsAvailable, jobId: id });
    if (job.other) {
      this.showInputTextforOtherRole = true;
    }
  }

  getJob(params) {
    const { jobs, jobId } = params;
    return jobs.find(job => job.id === +jobId);
  }
}
