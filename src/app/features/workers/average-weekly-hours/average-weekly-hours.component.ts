import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from 'src/app/core/model/worker.model';
import { MessageService } from 'src/app/core/services/message.service';
import { WorkerEditResponse, WorkerService } from 'src/app/core/services/worker.service';

@Component({
  selector: 'app-average-weekly-hours',
  templateUrl: './average-weekly-hours.component.html',
})
export class AverageWeeklyHoursComponent implements OnInit, OnDestroy {
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
      weeklyHoursAverageKnown: null,
      weeklyHoursAverage: [null, [Validators.min(0), Validators.max(65)]],
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        if (worker.weeklyHoursAverage) {
          this.form.patchValue({
            weeklyHoursAverageKnown: worker.weeklyHoursAverage.value,
            weeklyHoursAverage: worker.weeklyHoursAverage.hours,
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  weeklyHoursAverageKnownChangeHandler() {
    this.form.controls['weeklyHoursAverage'].reset();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker/salary']);
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
        worker.weeklyHoursAverage = { value: weeklyHoursAverageKnown.value, hours: weeklyHoursAverage.value };

        this.subscriptions.push(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        if (weeklyHoursAverage.errors.min || weeklyHoursAverage.errors.max) {
          this.messageService.show('error', 'Average weekly hours must be between 0 and 65.');
        }

        reject();
      }
    });
  }
}
