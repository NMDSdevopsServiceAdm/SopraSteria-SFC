import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mental-health',
  templateUrl: './mental-health.component.html',
})
export class MentalHealthComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', `Don't know`];
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    if (this.worker.mainJob.jobId !== 27 && !this.isOtherJobsSocialWorker()) {
      this.router.navigate(['/worker', this.worker.uid, 'staff-details'], { replaceUrl: true });
    }

    this.backLink = this.isOtherJobsSocialWorker() ? 'other-job-roles' : 'staff-details';

    this.form = this.formBuilder.group({
      approvedMentalHealthWorker: null,
    });

    if (this.worker.approvedMentalHealthWorker) {
      this.form.patchValue({
        approvedMentalHealthWorker: this.worker.approvedMentalHealthWorker,
      });
    }
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
        this.worker.approvedMentalHealthWorker = approvedMentalHealthWorker;
        this.subscriptions.add(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        this.messageService.show('error', 'Please fill required fields.');
        reject();
      }
    });
  }
}
