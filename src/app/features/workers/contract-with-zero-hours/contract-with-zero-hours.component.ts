import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-contract-with-zero-hours',
  templateUrl: './contract-with-zero-hours.component.html',
})
export class ContractWithZeroHoursComponent implements OnInit, OnDestroy {
  public backLink: string;
  public answersAvailable = ['Yes', 'No', `Don't know`];
  public form: FormGroup;
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
      zeroHoursContract: null,
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
      this.backLink = [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract)
        ? 'days-of-sickness'
        : 'adult-social-care-started';

      if (this.worker.zeroHoursContract) {
        this.form.patchValue({
          zeroHoursContract: this.worker.zeroHoursContract,
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

      const { zeroHoursContract } = this.form.value;
      if (
        zeroHoursContract === 'Yes' ||
        [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
      ) {
        this.router.navigate(['/worker', this.worker.uid, 'average-weekly-hours']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'weekly-contracted-hours']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { zeroHoursContract } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          zeroHoursContract: zeroHoursContract.value,
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        this.messageService.show('error', 'Please fill the required fields.');

        reject();
      }
    });
  }
}
