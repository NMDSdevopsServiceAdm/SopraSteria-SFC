import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { EthnicityService } from '@core/services/ethnicity.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

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
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    this.form = this.formBuilder.group({
      ethnicity: null,
    });

    if (this.worker.ethnicity) {
      this.form.patchValue({
        ethnicity: this.worker.ethnicity.ethnicityId,
      });
    }

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

      const ethnicityStr = this.ethnicities;

      let result;
      Object.keys(this.ethnicities).forEach(group => {
        this.ethnicities[group].forEach(obj => {
          if (obj.id === parseInt(ethnicity, 10)) {
            result = obj;
          }
        });
      });

      if (this.form.valid) {
        this.worker.ethnicity = ethnicity ? result : null;
        this.subscriptions.add(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        this.messageService.show('error', 'Please fill the required fields.');
        reject();
      }
    });
  }
}
