import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/constants/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-weekly-contracted-hours',
  templateUrl: './weekly-contracted-hours.component.html',
})
export class WeeklyContractedHoursComponent implements OnInit, OnDestroy {
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
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
    ) {
      this.router.navigate(['/worker', this.worker.uid, 'average-weekly-hours'], { replaceUrl: true });
    }

    this.form = this.formBuilder.group({
      weeklyHoursContractedKnown: null,
      weeklyHoursContracted: [null, [Validators.min(0), Validators.max(65)]],
    });

    if (this.worker.weeklyHoursContracted) {
      this.form.patchValue({
        weeklyHoursContractedKnown: this.worker.weeklyHoursContracted.value,
        weeklyHoursContracted: this.worker.weeklyHoursContracted.hours,
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  weeklyHoursContractedKnownChangeHandler() {
    this.form.controls['weeklyHoursContracted'].reset();
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
      const { weeklyHoursContractedKnown, weeklyHoursContracted } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        worker.weeklyHoursContracted = weeklyHoursContractedKnown.value
          ? { value: weeklyHoursContractedKnown.value, hours: weeklyHoursContracted.value }
          : null;

        this.subscriptions.add(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        if (weeklyHoursContracted.errors.min || weeklyHoursContracted.errors.max) {
          this.messageService.show('error', 'Average weekly hours must be between 0 and 65.');
        }

        reject();
      }
    });
  }
}
