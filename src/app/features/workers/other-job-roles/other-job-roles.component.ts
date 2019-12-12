import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Job, JobRole } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { JobService } from '@core/services/job.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-other-job-roles',
  templateUrl: './other-job-roles.component.html',
})
export class OtherJobRolesComponent extends QuestionComponent {
  public availableJobRoles: Job[];
  public jobsWithOtherRole: JobRole[] = [];
  public otherJobs: string;
  private otherJobRoleCharacterLimit = 120;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected jobService: JobService
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      selectedJobRoles: this.formBuilder.array([]),
      otherJobs: null,
    });
  }

  get selectedJobRoles(): FormArray {
    return this.form.get('selectedJobRoles') as FormArray;
  }

  init() {
    this.subscriptions.add(
      this.jobService.getJobs().subscribe(
        jobRoles => {
          this.availableJobRoles = jobRoles.filter(j => j.id !== this.worker.mainJob.jobId);

          // TODO: This does not really allow fall back for non-javascript form submissions
          this.availableJobRoles.map(job => {
            const otherJob = this.worker.otherJobs && this.worker.otherJobs.find(o => o.jobId === job.id);

            if (job.other) {
              this.jobsWithOtherRole.push({
                jobId: job.id,
                other: otherJob ? otherJob.other : '',
              });
            }

            const control = this.formBuilder.control({
              jobId: job.id,
              title: job.title,
              checked: otherJob ? true : false,
            });
            this.selectedJobRoles.push(control);
          });
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
        () => this.updateForm()
      )
    );

    this.worker.otherJobs.length > 0
      ? this.form.patchValue({ otherJobs: 'Yes' })
      : this.form.patchValue({ otherJobs: 'No' });

    this.previous = this.getRoutePath('main-job-start-date');
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Worker Services could not be updated.',
      },
    ];
  }

  private updateForm(): void {
    this.jobsWithOtherRole.forEach((job: JobRole) => {
      this.form.addControl(
        `otherSelectedJobRole${job.jobId}`,
        new FormControl(job.other, {
          validators: Validators.maxLength(this.otherJobRoleCharacterLimit),
          updateOn: 'blur',
        })
      );

      this.formErrorsMap.push({
        item: `otherSelectedJobRole${job.jobId}`,
        type: [
          {
            name: 'maxlength',
            message: `Your job role must be ${this.otherJobRoleCharacterLimit} characters or less`,
          },
        ],
      });
    });
  }

  generateUpdateProps() {
    const { selectedJobRoles, otherJobs } = this.form.value;
    return {
      otherJobs: selectedJobRoles
        .filter(j => j.checked)
        .map(j => {
          const isJobWithRole = this.jobsWithOtherRole.some(jbRole => jbRole.jobId === j.jobId);
          if (isJobWithRole) {
            const otherValue = this.form.get(`otherSelectedJobRole${j.jobId}`).value;
            return {
              jobId: j.jobId,
              ...(otherValue && { other: otherValue }),
            };
          }

          return { jobId: j.jobId };
        }),
    };
  }

  onSuccess() {
    if (this.workerService.hasJobRole(this.worker, 23)) {
      this.next = this.getRoutePath('nursing-category');
    } else if (this.workerService.hasJobRole(this.worker, 27)) {
      this.next = this.getRoutePath('mental-health-professional');
    } else {
      this.next = this.getRoutePath('national-insurance-number');
    }
  }

  onChange(control) {
    control.value.checked = !control.value.checked;
  }

  showforOtherJobRole(control): boolean {
    const selectedJobRole = this.availableJobRoles.find(job => job.id === control.value.jobId);
    return selectedJobRole && selectedJobRole.other;
  }

  public removeOtherJobs(): void {
    this.worker.otherJobs = [];
    this.selectedJobRoles.controls.map(control => {
      control.value.checked = false;
    });
  }
}
