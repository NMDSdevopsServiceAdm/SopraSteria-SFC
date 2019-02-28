import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
})
export class SalaryComponent implements OnInit, OnDestroy {
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

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
    this.worker = this.route.parent.snapshot.data.worker;

    this.backLink =
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
        ? 'average-weekly-hours'
        : 'weekly-contracted-hours';

    this.form = this.formBuilder.group({
      terms: null,
      rate: null,
    });

    this.form.get('terms').valueChanges.subscribe(val => {
      const rate = this.form.get('rate');
      rate.clearValidators();
      rate.reset();

      if (val === 'Hourly') {
        rate.setValidators([Validators.min(2.5), Validators.max(200), Validators.required]);
      } else if (val === 'Annually') {
        rate.setValidators([Validators.min(500), Validators.max(200000), Validators.required]);
      }

      rate.updateValueAndValidity();
    });

    if (this.worker.annualHourlyPay) {
      this.form.patchValue({
        terms: this.worker.annualHourlyPay.value,
        rate: this.worker.annualHourlyPay.rate,
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

      this.router.navigate(['/worker', this.worker.uid, 'care-certificate']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { terms, rate } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        worker.annualHourlyPay = terms.value ? { value: terms.value, rate: rate.value } : null;

        this.subscriptions.add(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        // TODO - ideally, the min and max values should be constants
        // and shared equally between onNgInit when creating the form control
        // and here within onSubmit.
        // Look to improving when implementing cross-validation checks.
        if (terms.value === 'Hourly' && rate.errors) {
          this.messageService.show('error', 'Hourly rate must be between £2.50 and £200.');
        }

        if (terms.value === 'Annually' && rate.errors) {
          this.messageService.show('error', 'Annual salary must be between £500 and £200,000');
        }

        reject();
      }
    });
  }
}
