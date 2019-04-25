import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Job } from '@core/model/job.model';
import { Worker } from '@core/model/worker.model';
import { JobService } from '@core/services/job.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
})
export class StaffDetailsComponent implements OnInit, OnDestroy {
  public contractsAvailable: Array<string> = [];
  public form: FormGroup;
  public jobsAvailable: Job[] = [];
  public backLink: string[] = null;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private jobService: JobService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
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

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      if (worker) {
        this.worker = worker;

        if (this.workerService.returnToSummary) {
          this.backLink = ['/worker', this.worker.uid, 'summary'];
        } else {
          this.backLink = ['/worker', 'start-screen'];
        }

        this.form.patchValue({
          nameOrId: this.worker.nameOrId,
          mainJob: this.worker.mainJob.jobId,
          contract: this.worker.contract,
        });
      } else {
        this.backLink = ['/dashboard'];
      }
    });

    this.contractsAvailable = Object.values(Contracts);

    this.subscriptions.add(this.jobService.getJobs().subscribe(jobs => (this.jobsAvailable = jobs)));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      const { mainJob } = this.form.value;

      if (parseInt(mainJob, 10) === 27) {
        this.router.navigate(['/worker', this.worker.uid, 'mental-health-professional']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'main-job-start-date']);
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
        const props = {
          nameOrId: nameOrId.value,
          contract: contract.value,
          mainJob: {
            jobId: parseInt(mainJob.value, 10),
          },
        };

        if (this.worker) {
          // TODO: https://trello.com/c/x3N7dQJP
          if (this.worker.otherJobs) {
            (props as any).otherJobs = this.worker.otherJobs.filter(j => j.jobId !== parseInt(mainJob.value, 10));
          }

          this.subscriptions.add(
            this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
              this.workerService.setState({ ...this.worker, ...data });
              resolve();
            }, reject)
          );
        } else {
          this.subscriptions.add(
            this.workerService.createWorker(props as Worker).subscribe(data => {
              this.workerService.setState({ ...this.worker, ...data });
              this.worker = data as Worker;
              resolve();
            }, reject)
          );
        }
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
