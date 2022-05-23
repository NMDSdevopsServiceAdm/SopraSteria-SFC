import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { Job } from '@core/model/job.model';
import { AlertService } from '@core/services/alert.service';
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
  public contractsAvailable: Array<string> = [];
  public jobsAvailable: Job[] = [];
  public showInputTextforOtherRole: boolean;
  public submitTitle = 'Save staff record';
  public canReturn = false;
  public canExit = true;
  public editFlow: boolean;
  private otherJobRoleCharacterLimit = 120;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    public workerService: WorkerService,
    protected alertService: AlertService,
    private jobService: JobService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      nameOrId: [null, Validators.required],
      mainJob: [null, Validators.required],
      otherJobRole: [null, [Validators.maxLength(this.otherJobRoleCharacterLimit)]],
      contract: [null, Validators.required],
    });
  }

  init(): void {
    this.contractsAvailable = Object.values(Contracts);
    this.editFlow = !!this.worker;
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

    this.previous =
      this.primaryWorkplace && this.workplace.uid === this.primaryWorkplace.uid
        ? ['/dashboard']
        : ['/workplace', this.workplace.uid];
  }

  renderInEditMode(): void {
    this.form.patchValue({
      nameOrId: this.worker.nameOrId,
      mainJob: this.worker.mainJob.jobId,
      otherJobRole: this.worker.mainJob.other,
      contract: this.worker.contract,
    });

    this.selectedJobRole(this.worker.mainJob.jobId);

    if (this.workerService.returnTo === null) {
      const mandatoryDetailsURL = { url: this.getRoutePath('mandatory-details') };
      this.workerService.setReturnTo(mandatoryDetailsURL);
      this.return = mandatoryDetailsURL;
    }

    this.canReturn = true;
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
    this.showInputTextforOtherRole = false;
    const otherJob = this.jobsAvailable.find((job) => job.id === +id);
    if (otherJob && otherJob.other) {
      this.showInputTextforOtherRole = true;
    }
  }

  protected navigate(): void {
    const currentUrl = this.router.url;

    if (!this.worker) {
      return this.onCancel();
    }

    if (!this.next) {
      this.next = this.getRoutePath('');
    }

    this.router.navigate(this.next).then(() => {
      if (currentUrl.endsWith('create-staff-record')) {
        this.alertService.addAlert({
          type: 'success',
          message: 'Staff record saved',
        });
      }
    });
  }

  onSuccess() {
    const path = this.editFlow ? '' : 'mandatory-details';
    this.next = this.getRoutePath(path);
  }

  private onCancel(): void {
    this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }
}
