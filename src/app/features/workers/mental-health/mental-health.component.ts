import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-mental-health',
  templateUrl: './mental-health.component.html',
})
export class MentalHealthComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', `Don't know`];
  public form: FormGroup;
  private subscriptions = [];
  private worker: Worker;
  private workerId: string;

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

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        this.form.patchValue({
          approvedMentalHealthWorker: worker.approvedMentalHealthWorker,
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      if (this.isOtherJobsSocialWorker()) {
        this.router.navigate(['/worker/national-insurance-number']);
      } else {
        this.router.navigate(['/worker/main-job-start-date']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  private isOtherJobsSocialWorker() {
    return this.worker.otherJobs && this.worker.otherJobs.some(j => j.jobId === 27);
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      const { approvedMentalHealthWorker } = this.form.value;
      this.messageService.clearError();

      if (this.form.valid) {
        this.worker.approvedMentalHealthWorker = approvedMentalHealthWorker;
        this.subscriptions.push(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        this.messageService.show('error', 'Please fill required fields.');
        reject();
      }
    });
  }

  goBack(event) {
    event.preventDefault();

    if (this.isOtherJobsSocialWorker()) {
      this.router.navigate(['/worker/other-job-roles']);
    } else {
      this.router.navigate(['/worker/edit-staff-record']);
    }
  }
}
