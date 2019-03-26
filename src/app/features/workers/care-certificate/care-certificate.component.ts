import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-care-certificate',
  templateUrl: './care-certificate.component.html',
})
export class CareCertificateComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes, completed', 'Yes, in progress or partially completed', 'No'];
  public form: FormGroup;
  public backLink: string;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      careCertificate: null,
    });

    if (this.workerService.returnToSummary) {
      this.backLink = 'summary';
    } else {
      this.backLink = 'salary';
    }

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.careCertificate) {
        this.form.patchValue({
          careCertificate: this.worker.careCertificate,
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

      this.router.navigate(['/worker', this.worker.uid, 'apprenticeship-training']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { careCertificate } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          careCertificate: careCertificate.value,
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
}
