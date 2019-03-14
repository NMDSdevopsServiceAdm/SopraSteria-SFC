import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { EthnicityService } from '@core/services/ethnicity.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-ethnicity',
  templateUrl: './ethnicity.component.html',
})
export class EthnicityComponent implements OnInit, OnDestroy {
  public ethnicities: any = {};
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

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

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.ethnicity) {
        this.form.patchValue({
          ethnicity: this.worker.ethnicity.ethnicityId,
        });
      }
    });

    this.subscriptions.add(this.ethnicityService.getEthnicities().subscribe(res => (this.ethnicities = res.byGroup)));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
      this.router.navigate(['/worker', this.worker.uid, 'nationality']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { ethnicity } = this.form.value;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          ethnicity: {
            ethnicityId: parseInt(ethnicity, 10),
          },
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
