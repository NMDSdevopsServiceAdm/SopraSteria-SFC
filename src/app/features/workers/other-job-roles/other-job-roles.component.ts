import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { JobService } from '@core/services/job.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-other-job-roles',
  templateUrl: './other-job-roles.component.html',
})
export class OtherJobRolesComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public backLink: string;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService,
    private jobService: JobService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      selectedJobRoles: this.formBuilder.array([]),
    });

    if (this.workerService.returnTo) {
      this.backLink = 'summary';
    } else {
      this.backLink = 'main-job-start-date';
    }

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      this.subscriptions.add(
        this.jobService.getJobs().subscribe(availableJobRoles => {
          const availableJobRolesFiltered = availableJobRoles.filter(j => j.id !== this.worker.mainJob.jobId);
          const jobs = availableJobRolesFiltered.map(j =>
            this.formBuilder.control({
              jobId: j.id,
              title: j.title,
              checked: this.worker.otherJobs ? this.worker.otherJobs.some(o => o.jobId === j.id) : false,
            })
          );

          jobs.forEach(j => (this.form.controls.selectedJobRoles as FormArray).push(j));
        })
      );
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      if (this.form.value.selectedJobRoles.some(j => j.checked && j.jobId === 27)) {
        this.router.navigate(['/worker', this.worker.uid, 'mental-health-professional']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'national-insurance-number']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { selectedJobRoles } = this.form.value;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          otherJobs: selectedJobRoles.filter(j => j.checked).map(j => ({ jobId: j.jobId, title: j.title })),
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        reject();
      }
    });
  }

  onChange(control) {
    control.value.checked = !control.value.checked;
  }
}
