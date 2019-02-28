import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-apprenticeship-training',
  templateUrl: './apprenticeship-training.component.html',
})
export class ApprenticeshipTrainingComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', `Don't know`];
  public form: FormGroup;
  private subscriptions: Subscription = new Subscription;
  private worker: Worker;

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      apprenticeshipTraining: null,
    });

    this.worker = this.route.parent.snapshot.data.worker;

    if (this.worker.apprenticeshipTraining) {
      this.form.patchValue({
        apprenticeshipTraining: this.worker.apprenticeshipTraining,
      });
    }
  }

  ngOnDestroy() {
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker', this.worker.uid, 'social-care-qualification']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { apprenticeshipTraining } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        worker.apprenticeshipTraining = apprenticeshipTraining.value;

        this.subscriptions.add(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        reject();
      }
    });
  }
}
