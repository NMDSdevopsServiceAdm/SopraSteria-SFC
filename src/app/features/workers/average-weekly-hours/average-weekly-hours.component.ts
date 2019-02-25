import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-average-weekly-hours',
  templateUrl: './average-weekly-hours.component.html',
})
export class AverageWeeklyHoursComponent implements OnInit, OnDestroy {
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

    if (
      !(
        this.worker.zeroHoursContract === 'Yes' ||
        [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
      )
    ) {
      this.router.navigate(['/worker', this.worker.uid, 'weekly-contracted-hours'], { replaceUrl: true });
    }

    this.form = this.formBuilder.group({
      weeklyHoursAverageKnown: null,
      weeklyHoursAverage: [null, [Validators.min(0), Validators.max(65)]],
    });

    if (this.worker.weeklyHoursAverage) {
      this.form.patchValue({
        weeklyHoursAverageKnown: this.worker.weeklyHoursAverage.value,
        weeklyHoursAverage: this.worker.weeklyHoursAverage.hours,
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  weeklyHoursAverageKnownChangeHandler() {
    this.form.controls['weeklyHoursAverage'].reset();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker', this.worker.uid, 'salary']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { weeklyHoursAverageKnown, weeklyHoursAverage } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        worker.weeklyHoursAverage = weeklyHoursAverageKnown.value
          ? { value: weeklyHoursAverageKnown.value, hours: weeklyHoursAverage.value }
          : null;

        this.subscriptions.add(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        if (weeklyHoursAverage.errors.min || weeklyHoursAverage.errors.max) {
          this.messageService.show('error', 'Average weekly hours must be between 0 and 65.');
        }

        reject();
      }
    });
  }
}
