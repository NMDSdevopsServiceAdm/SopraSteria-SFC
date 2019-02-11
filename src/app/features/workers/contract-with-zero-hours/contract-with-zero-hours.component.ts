import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from 'src/app/core/model/worker.model';
import { MessageService } from 'src/app/core/services/message.service';
import { WorkerEditResponse, WorkerService } from 'src/app/core/services/worker.service';
import { Contracts } from 'src/app/core/constants/contracts.enum';

@Component({
  selector: 'app-contract-with-zero-hours',
  templateUrl: './contract-with-zero-hours.component.html',
})
export class ContractWithZeroHoursComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', `Don't know`];
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
      zeroHoursContract: null,
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        if (worker.zeroHoursContract) {
          this.form.patchValue({
            zeroHoursContract: worker.zeroHoursContract,
          });
        }
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

      if (
        this.worker.zeroHoursContract === 'Yes' ||
        [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
      ) {
        this.router.navigate([`/worker/average-weekly-hours`]);
      } else {
        this.router.navigate([`/worker/average-contracted-hours`]);
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
        const worker = this.worker || ({} as Worker);
        worker.zeroHoursContract = zeroHoursContract.value;

        this.subscriptions.push(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        this.messageService.show('error', 'Please fill the required fields.');

        reject();
      }
    });
  }
}
