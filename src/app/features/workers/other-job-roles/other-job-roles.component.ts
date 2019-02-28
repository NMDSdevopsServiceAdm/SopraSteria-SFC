import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from '@core/model/job.model';
import { Worker } from '@core/model/worker.model';
import { JobService } from '@core/services/job.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-other-job-roles',
  templateUrl: './other-job-roles.component.html',
})
export class OtherJobRolesComponent implements OnInit, OnDestroy {
  public availableJobRoles: Job[];
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService,
    private jobService: JobService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    this.form = this.formBuilder.group({
      selectedJobRoles: this.formBuilder.array([]),
    });

    this.subscriptions.add(
      this.jobService.getJobs().subscribe(availableJobRoles => {
        let jobs = null;
        const mainJobIndex = availableJobRoles.findIndex(j => j.id === this.worker.mainJob.jobId);
        const availableJobRolesFiltered = availableJobRoles.slice(0);
        availableJobRolesFiltered.splice(mainJobIndex, 1);

        jobs = this.worker.otherJobs
          ? availableJobRolesFiltered.map(j =>
              this.formBuilder.control({
                jobId: j.id,
                title: j.title,
                checked: this.worker.otherJobs.some(o => o.jobId === j.id),
              })
            )
          : availableJobRolesFiltered.map(j =>
              this.formBuilder.control({ jobId: j.id, title: j.title, checked: false })
            );

        jobs.forEach(j => (this.form.controls.selectedJobRoles as FormArray).push(j));
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      if (this.isOtherJobsSocialWorker() && this.worker.mainJob.title !== 'Social Worker') {
        this.router.navigate(['/worker', this.worker.uid, 'mental-health']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'national-insurance-number']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  private isOtherJobsSocialWorker(): boolean {
    return this.form.value.selectedJobRoles.some(j => j.checked && j.jobId === 27);
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { selectedJobRoles } = this.form.value;
      this.messageService.clearError();

      if (this.form.valid) {
        this.worker.otherJobs = selectedJobRoles.filter(j => j.checked).map(j => ({ jobId: j.jobId, title: j.title }));
        this.subscriptions.add(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        reject();
      }
    });
  }

  onChange(control) {
    control.value.checked = !control.value.checked;
  }
}
