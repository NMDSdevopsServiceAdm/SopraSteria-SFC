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
  public contractsAvailable = [
    { value: Contracts.Permanent, tag: 'Permanent' },
    { value: Contracts.Temporary, tag: 'Temporary' },
    { value: Contracts.Pool_Bank, tag: 'Pool, Bank' },
    { value: Contracts.Agency, tag: 'Agency' },
    { value: Contracts.Other, tag: 'Other' },
  ];
  public jobsAvailable: Job[] = [];
  public showInputTextforOtherRole: boolean;
  public submitTitle = 'Save this staff record';
  public canReturn = false;
  public canExit = true;
  public editFlow: boolean;
  private otherJobRoleCharacterLimit = 120;
  public staffDetailsReturn;
  public isPrimaryAccount: boolean;
  public inMandatoryDetailsFlow: boolean;

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
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'staff-record';
    this.inMandatoryDetailsFlow = this.route.snapshot.parent.url[0].path === 'mandatory-details';
    this.flow = this.insideFlow ? 'staff-record' : 'staff-record/staff-record-summary';
    this.editFlow = !!this.worker;
    this.isPrimaryAccount = this.primaryWorkplace && this.workplace.uid === this.primaryWorkplace.uid;
    this.getJobs();
    this.setBackLinks();
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
    this.canReturn = true;
  }

  setBackLinks(): void {
    if (this.insideFlow && this.isPrimaryAccount) {
      this.backService.setBackLink({ url: ['/dashboard'], fragment: 'staff-records' });
    } else if (this.insideFlow && !this.isPrimaryAccount) {
      this.backService.setBackLink({ url: ['/workplace', this.workplace.uid], fragment: 'staff-records' });
    } else if (!this.insideFlow && !this.inMandatoryDetailsFlow) {
      this.backService.setBackLink({ url: this.getRoutePath('staff-record-summary') });
    } else {
      this.backService.setBackLink({ url: this.getRoutePath('mandatory-details') });
    }
  }

  public navigate(action: string): void {
    switch (action) {
      case 'continue':
        if (this.flow === 'staff-record' && !this.editFlow) {
          this.next = this.getRoutePath('mandatory-details');
          this.router.navigate(this.next).then(() => {
            this.alertService.addAlert({
              type: 'success',
              message: 'Staff record saved',
            });
          });
        }

        if (this.flow === 'staff-record/staff-record-summary') {
          this.next = this.getRoutePath('staff-record-summary');
          this.router.navigate(this.next);
        }
        break;

      case 'exit':
        if (this.isPrimaryAccount) {
          this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
        } else {
          this.router.navigate(['/workplace', this.workplace.uid], { fragment: 'staff-records' });
        }
        break;

      case 'return':
        if (this.inMandatoryDetailsFlow) {
          this.router.navigate(this.getRoutePath('mandatory-details'));
        } else {
          this.router.navigate(this.getRoutePath('staff-record-summary'));
        }
        break;
    }
  }
}
