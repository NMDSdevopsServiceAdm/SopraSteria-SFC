import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-days-of-sickness',
  templateUrl: './days-of-sickness.component.html',
})
export class DaysOfSicknessComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.otherChangeHandler = this.otherChangeHandler.bind(this);
    this.valueValidator = this.valueValidator.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    if (![Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract)) {
      this.router.navigate(['/worker', this.worker.uid, 'adult-social-care-started'], { replaceUrl: true });
    }

    this.form = this.formBuilder.group({
      valueKnown: null,
      value: [null, this.valueValidator],
    });

    if (this.worker.daysSick) {
      this.form.patchValue({
        valueKnown: this.worker.daysSick.value,
        value: this.worker.daysSick.days ? this.worker.daysSick.days : null,
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
      this.router.navigate(['/worker', this.worker.uid, 'contract-with-zero-hours']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { valueKnown, value } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        if (valueKnown.value) {
          this.worker.daysSick = {
            value: valueKnown.value,
            days: Math.round(value.value * 2) / 2,
          };
        }

        this.subscriptions.add(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        if (value.errors.required) {
          this.messageService.show('error', `'Number of days' is required.`);
        }

        reject();
      }
    });
  }

  otherChangeHandler() {
    this.form.controls.value.reset();
  }

  valueValidator() {
    if (this.form) {
      const { valueKnown } = this.form.value;
      const value = this.form.controls.value.value;

      if (valueKnown === 'Yes' && !value) {
        return { required: true };
      }
    }

    return null;
  }
}
