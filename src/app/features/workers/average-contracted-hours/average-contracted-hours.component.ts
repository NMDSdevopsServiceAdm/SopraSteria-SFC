import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from 'src/app/core/model/worker.model';
import { MessageService } from 'src/app/core/services/message.service';
import { WorkerEditResponse, WorkerService } from 'src/app/core/services/worker.service';

@Component({
  selector: 'app-average-contracted-hours',
  templateUrl: './average-contracted-hours.component.html',
})
export class AverageContractedHoursComponent implements OnInit, OnDestroy {
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
      weeklyHoursContractedKnown: null,
      weeklyHoursContracted: [null, [Validators.min(0), Validators.max(65)]],
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        if (worker.weeklyHoursContracted) {
          this.form.patchValue({
            weeklyHoursContractedKnown: worker.weeklyHoursContracted.value,
            weeklyHoursContracted: worker.weeklyHoursContracted.hours,
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  weeklyHoursContractedKnownChangeHandler() {
    this.form.controls['weeklyHoursContracted'].reset();
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
      const { weeklyHoursContractedKnown, weeklyHoursContracted } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        worker.weeklyHoursContracted = weeklyHoursContractedKnown.value
          ? { value: weeklyHoursContractedKnown.value, hours: weeklyHoursContracted.value }
          : null;

        this.subscriptions.push(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        if (weeklyHoursContracted.errors.min || weeklyHoursContracted.errors.max) {
          this.messageService.show('error', 'Average weekly hours must be between 0 and 65.');
        }

        reject();
      }
    });
  }
}
