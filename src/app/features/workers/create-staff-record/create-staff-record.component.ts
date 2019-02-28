import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Job } from '@core/model/job.model';
import { Worker } from '@core/model/worker.model';
import { JobService } from '@core/services/job.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-staff-record',
  templateUrl: './create-staff-record.component.html',
})
export class CreateStaffRecordComponent implements OnInit, OnDestroy {
  public contractsAvailable: Array<string> = [];
  public form: FormGroup;
  public jobsAvailable: Job[] = [];
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private jobService: JobService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nameOrId: [null, Validators.required],
      mainJob: [null, Validators.required],
      contract: [null, Validators.required],
    });

    this.worker = this.route.parent.snapshot.data.worker;

    if (this.worker) {
      this.form.patchValue({
        nameOrId: this.worker.nameOrId,
        mainJob: this.worker.mainJob.jobId,
        contract: this.worker.contract,
      });
    }

    this.contractsAvailable = Object.values(Contracts);

    this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobsAvailable = jobs)));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  private isSocialWorkerSelected(): boolean {
    const { mainJob } = this.form.value;
    if (mainJob) {
      return this.jobsAvailable.some(a => a.id === parseInt(mainJob, 10) && a.title === 'Social Worker');
    }

    return false;
  }

  async submitHandler() {
    try {
      const res = await this.saveHandler();

      if (this.isSocialWorkerSelected()) {
        this.router.navigate(['/worker', res.uid, 'mental-health']);
      } else {
        this.router.navigate(['/worker', res.uid, 'main-job-start-date']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { nameOrId, contract, mainJob } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        const job = this.jobsAvailable.find(j => j.id === parseInt(mainJob.value, 10));

        worker.nameOrId = nameOrId.value;
        worker.contract = contract.value;
        worker.mainJob = {
          jobId: job.id,
          title: job.title,
        };

        if (worker.otherJobs) {
          const index = worker.otherJobs.findIndex(j => j.jobId === worker.mainJob.jobId);

          if (index !== -1) {
            worker.otherJobs.splice(index, 1);
          }
        }

        this.subscriptions.add(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        if (nameOrId.errors && nameOrId.errors.required) {
          this.messageService.show('error', `'Full name or ID number' is required.`);
        }

        if (mainJob.errors && mainJob.errors.required) {
          this.messageService.show('error', `'Main job role' is required.`);
        }

        if (contract.errors && contract.errors.required) {
          this.messageService.show('error', `'Type of contract' is required.`);
        }

        reject();
      }
    });
  }
}
