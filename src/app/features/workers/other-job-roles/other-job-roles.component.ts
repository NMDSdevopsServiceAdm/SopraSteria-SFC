import { Component } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { JobService } from '@core/services/job.service';
import { WorkerService } from '@core/services/worker.service';
import { Job } from '@core/model/job.model';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-other-job-roles',
  templateUrl: './other-job-roles.component.html',
})
export class OtherJobRolesComponent extends QuestionComponent {

  showforOtherJobRole: boolean;

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
      this.jobService.getJobs().subscribe(jobRoles => {
        const availableJobRoles: Job[] = jobRoles.filter(j => j.id !== this.worker.mainJob.jobId);

        // TODO: This does not really allow fall back for non-javascript form submissions
        availableJobRoles.map(job => {
          const control = this.formBuilder.control({
            jobId: job.id,
            title: job.title,
            other: this.worker.mainJob.other,
            checked: this.worker.otherJobs ? this.worker.otherJobs.some(o => o.jobId === job.id) : false
          });
          (this.form.controls.selectedJobRoles as FormArray).push(control);
        });
      })
    );

    this.previous = ['/worker', this.worker.uid, 'main-job-start-date'];
  }

  generateUpdateProps() {
    const { selectedJobRoles } = this.form.value;

    return {
      otherJobs: selectedJobRoles.filter(j => j.checked).map(j => ({ jobId: j.jobId, title: j.title })),
    };
  }

  onSuccess() {
    this.next = this.worker.otherJobs.some(j => j.jobId === 27)
      ? ['/worker', this.worker.uid, 'mental-health-professional']
      : ['/worker', this.worker.uid, 'national-insurance-number'];
  }

  onChange(control) {
    control.value.checked = !control.value.checked;
    this.showforOtherJobRole = control.value.jobId === 19;


  }
}
