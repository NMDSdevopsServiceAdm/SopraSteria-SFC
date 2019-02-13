import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from 'src/app/core/constants/contracts.enum';
import { Worker } from 'src/app/core/model/worker.model';
import { MessageService } from 'src/app/core/services/message.service';
import { WorkerEditResponse, WorkerService } from 'src/app/core/services/worker.service';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
})
export class SalaryComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private worker: Worker;
  private workerId: string;
  private subscriptions = [];

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      terms: null,
      rate: null,
    });

    this.form.get('terms').valueChanges.subscribe(val => {
      const rate = this.form.get('rate');
      rate.clearValidators();
      rate.reset();

      if (val === 'Hourly') {
        rate.setValidators([Validators.min(2.5), Validators.max(100), Validators.required]);
      } else if (val === 'Annually') {
        rate.setValidators([Validators.min(500), Validators.max(200000), Validators.required]);
      }

      rate.updateValueAndValidity();
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        if (worker.annualHourlyPay) {
          this.form.patchValue({
            terms: worker.annualHourlyPay.value,
            rate: worker.annualHourlyPay.rate,
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  goBack(event: MouseEvent) {
    event.preventDefault();

    if (
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
    ) {
      this.router.navigate(['/worker/average-weekly-hours']);
    } else {
      this.router.navigate(['/worker/average-contracted-hours']);
    }
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker/care-certificate']);
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
        worker.annualHourlyPay = {
          value: terms.value,
          rate: rate.value,
        };

        this.subscriptions.push(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        if (terms.value === 'Hourly' && rate.errors) {
          this.messageService.show('error', 'Hourly rate must be between £2.50 and £100.');
        }

        if (terms.value === 'Annually' && rate.errors) {
          this.messageService.show('error', 'Annual salary must be between £500 and £200,000');
        }

        reject();
      }
    });
  }
}
