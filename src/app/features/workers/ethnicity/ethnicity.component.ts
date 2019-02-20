import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { EthnicityService } from '@core/services/ethnicity.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-ethnicity',
  templateUrl: './ethnicity.component.html',
})
export class EthnicityComponent implements OnInit, OnDestroy {
  public ethnicities: any = {};
  public form: FormGroup;
  private workerId: string;
  private worker: Worker;
  private subscriptions = [];

  constructor(
    private workerService: WorkerService,
    private ethnicityService: EthnicityService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      ethnicity: null,
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        if (worker.ethnicity) {
          this.form.patchValue({
            ethnicity: worker.ethnicity.ethnicityId,
          });
        }
      })
    );

    this.subscriptions.push(this.ethnicityService.getEthnicities().subscribe(res => (this.ethnicities = res.byGroup)));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  ethnicitiesUngrouped() {
    return this.ethnicities[''];
  }

  ethnicityGroups() {
    return Object.keys(this.ethnicities).filter(e => e.length);
  }

  async submitHandler() {
    try {
      await this.saveHandler();
      this.router.navigate(['/worker/nationality']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { ethnicity } = this.form.value;
      this.messageService.clearError();

      if (this.form.valid) {
        this.worker.ethnicity = ethnicity ? { ethnicityId: parseInt(ethnicity, 10) } : null;
        this.workerService.setWorker(this.worker).subscribe(resolve, reject);
      } else {
        this.messageService.show('error', 'Please fill the required fields.');
        reject();
      }
    });
  }
}
