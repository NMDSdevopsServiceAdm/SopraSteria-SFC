import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';

@Component({
  selector: 'app-adult-social-care-started',
  templateUrl: './adult-social-care-started.component.html',
})
export class AdultSocialCareStartedComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private worker: Worker;

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
    this.form = this.formBuilder.group({
      valueKnown: null,
      value: [null, this.valueValidator],
    });

    this.worker = this.route.parent.snapshot.data.worker;

    if (this.worker.socialCareStartDate) {
      this.form.patchValue({
        valueKnown: this.worker.socialCareStartDate.value,
        value: this.worker.socialCareStartDate.year ? this.worker.socialCareStartDate.year : null,
      });
    }
  }

  ngOnDestroy() {
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker', this.worker.uid, 'days-of-sickness']);
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
          this.worker.socialCareStartDate = {
            value: valueKnown.value,
            year: value.value,
          };
        }

        this.workerService.setWorker(this.worker).subscribe(resolve, reject);
      } else {
        if (value.errors.required) {
          this.messageService.show('error', 'Year is required.');
        } else if (value.errors.yearDigits) {
          this.messageService.show('error', 'Year must have 4 digits.');
        } else if (value.errors.yearInFuture) {
          this.messageService.show('error', `Year can't be in the future.`);
        } else if (value.errors.yearTooEarly) {
          this.messageService.show('error', `Year can't be earlier than 100 years ago.`);
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
      const { valueKnown, value } = this.form.value;

      if (valueKnown === 'Yes') {
        if (value) {
          const currentYear = moment().year();

          if (currentYear - value < 0) {
            return { yearInFuture: true };
          } else if (currentYear - value > 100) {
            return { yearTooEarly: true };
          }

          return value.toString().length < 4 ? { yearDigits: true } : null;
        } else {
          return { required: true };
        }
      }
    }

    return null;
  }
}
