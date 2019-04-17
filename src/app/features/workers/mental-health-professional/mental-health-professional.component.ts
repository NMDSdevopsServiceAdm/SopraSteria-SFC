import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-mental-health-professional',
  templateUrl: './mental-health-professional.component.html',
})
export class MentalHealthProfessionalComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', `Don't know`];
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      approvedMentalHealthWorker: null,
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.workerService.returnTo) {
        this.backLink = 'summary';
      } else {
        this.backLink = this.isOtherJobsSocialWorker() ? 'other-job-roles' : 'staff-details';
      }

      if (this.worker.mainJob.jobId !== 27 && !this.isOtherJobsSocialWorker()) {
        this.router.navigate(['/worker', this.worker.uid, 'staff-details'], { replaceUrl: true });
      }

      if (this.worker.approvedMentalHealthWorker) {
        this.form.patchValue({
          approvedMentalHealthWorker: this.worker.approvedMentalHealthWorker,
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      if (this.isOtherJobsSocialWorker()) {
        this.router.navigate(['/worker', this.worker.uid, 'national-insurance-number']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'main-job-start-date']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  private isOtherJobsSocialWorker() {
    return this.worker.otherJobs && this.worker.otherJobs.some(j => j.jobId === 27);
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { approvedMentalHealthWorker } = this.form.value;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          approvedMentalHealthWorker,
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        this.messageService.show('error', 'Please fill required fields.');
        reject();
      }
    });
  }
}
