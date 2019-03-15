import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NIN_PATTERN } from '@core/constants/constants';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-national-insurance-number',
  templateUrl: './national-insurance-number.component.html',
})
export class NationalInsuranceNumberComponent implements OnInit, OnDestroy {
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nin: [null, this.ninValidator],
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
      this.backLink = this.worker.otherJobs.some(j => j.jobId === 27)
        ? 'mental-health-professional'
        : 'other-job-roles';

      if (this.worker.nationalInsuranceNumber) {
        this.form.patchValue({
          nin: this.worker.nationalInsuranceNumber,
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
      this.router.navigate(['/worker', this.worker.uid, 'date-of-birth']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { nin } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          nationalInsuranceNumber: nin.value ? nin.value.toUpperCase() : null,
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (nin.errors.validNin) {
          this.messageService.show('error', 'Invalid National Insurance Number format.');
        } else {
          this.messageService.show('error', 'Please fill the required fields.');
        }

        reject();
      }
    });
  }

  ninValidator(control: AbstractControl) {
    return !control.value || NIN_PATTERN.test(control.value.toUpperCase()) ? null : { validNin: true };
  }
}
