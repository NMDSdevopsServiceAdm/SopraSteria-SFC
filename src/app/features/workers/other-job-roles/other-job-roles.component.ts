import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators  } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { JobService } from '@core/services/job.service';
import { WorkerService } from '@core/services/worker.service';
import { Job, JobRole } from '@core/model/job.model';
import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-other-job-roles',
  templateUrl: './other-job-roles.component.html',
})
export class OtherJobRolesComponent extends QuestionComponent {

  public availableJobRoles: Job[];
  public serverError: string;
  public jobsWithOtherRole: JobRole[] = [];
  private otherJobRoleCharacterLimit = 120;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected jobService: JobService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      selectedJobRoles: this.formBuilder.array([]),
    });
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
            (this.form.controls.selectedJobRoles as FormArray).push(control);
          });
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
       () => this.updateForm()
      )
    );

    this.previous = ['/worker', this.worker.uid, 'main-job-start-date'];
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [];
  }

  private updateForm(): void {
    this.jobsWithOtherRole.forEach((job: JobRole) => {
      this.form.addControl(
        `otherSelectedJobRole${job.jobId}`,
        new FormControl(job.other, {
          validators: Validators.maxLength(this.otherJobRoleCharacterLimit),
          updateOn: 'blur'
        })
      );

      this.formErrorsMap.push({
        item: `otherSelectedJobRole${job.jobId}`,
        type: [
          {
            name: 'maxlength',
            message: `Enter your job role must be ${this.otherJobRoleCharacterLimit} characters or less`,
          },
        ],
      });
    });
  }

  generateUpdateProps() {
    const { selectedJobRoles } = this.form.value;
    return {
      otherJobs: selectedJobRoles.filter(j => j.checked).map(j => {
        const isJobWithRole = this.jobsWithOtherRole.some(jbRole => jbRole.jobId === j.jobId);
        if (isJobWithRole) {
          const otherValue = this.form.get(`otherSelectedJobRole${j.jobId}`).value;
          return {
            jobId: j.jobId,
            ...(otherValue && {  other: otherValue })
          };
        }

        return { jobId: j.jobId };
      })
    };
  }

  onSuccess() {
    this.next = this.worker.otherJobs.some(j => j.jobId === 27)
      ? ['/worker', this.worker.uid, 'mental-health-professional']
      : ['/worker', this.worker.uid, 'national-insurance-number'];
  }

  onChange(control) {
    control.value.checked = !control.value.checked;
  }

  showforOtherJobRole(control): boolean {
    const selectedJobRole = this.availableJobRoles.find(
      job => job.id === control.value.jobId
    );
    return selectedJobRole && selectedJobRole.other;
  }
}
