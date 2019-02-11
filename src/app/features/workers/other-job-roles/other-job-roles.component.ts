import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Job } from '../../../core/model/job.model';
import { Worker } from '../../../core/model/worker.model';
import { JobService } from '../../../core/services/job.service';
import { MessageService } from '../../../core/services/message.service';
import { WorkerService } from '../../../core/services/worker.service';

@Component({
  selector: 'app-other-job-roles',
  templateUrl: './other-job-roles.component.html',
})
export class OtherJobRolesComponent implements OnInit, OnDestroy {
  public availableJobRoles: Job[];
  public form: FormGroup;
  private subscriptions: Subscription[] = [];
  private worker: Worker;
  private workerId: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService,
    private jobService: JobService,
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      selectedJobRoles: this.formBuilder.array([]),
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.jobService.getJobs().subscribe(availableJobRoles => {
        this.subscriptions.push(
          this.workerService.getWorker(this.workerId).subscribe(worker => {
            this.worker = worker;
            let jobs = null;
            const mainJobIndex = availableJobRoles.findIndex(j => j.id === worker.mainJob.jobId);
            const availableJobRolesFiltered = availableJobRoles.slice(0);
            availableJobRolesFiltered.splice(mainJobIndex, 1);

            jobs = worker.otherJobs
              ? availableJobRolesFiltered.map(j =>
                  this.formBuilder.control({
                    jobId: j.id,
                    title: j.title,
                    checked: worker.otherJobs.some(o => o.jobId === j.id),
                  }),
                )
              : availableJobRolesFiltered.map(j =>
                  this.formBuilder.control({ jobId: j.id, title: j.title, checked: false }),
                );

            jobs.forEach(j => (this.form.controls.selectedJobRoles as FormArray).push(j));
          }),
        );
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      if (this.isOtherJobsSocialWorker() && this.worker.mainJob.title !== 'Social Worker') {
        this.router.navigate(['/worker/mental-health']);
      } else {
        this.router.navigate(['/worker/national-insurance-number']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  private isOtherJobsSocialWorker(): boolean {
    return this.form.value.selectedJobRoles.some(j => j.checked && j.title === 'Social Worker');
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      const { selectedJobRoles } = this.form.value;
      this.messageService.clearError();

      if (this.form.valid) {
        this.worker.otherJobs = selectedJobRoles.filter(j => j.checked).map(j => ({ jobId: j.jobId }));
        this.subscriptions.push(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        reject();
      }
    });
  }

  onChange(control) {
    control.value.checked = !control.value.checked;
  }
}
