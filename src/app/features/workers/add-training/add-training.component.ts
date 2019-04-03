import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@core/validators/date.validator';
import * as moment from 'moment';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-add-training',
  templateUrl: './add-training.component.html',
})
export class AddTrainingComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public worker: Worker;

  constructor(private formBuilder: FormBuilder, private workerService: WorkerService) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      category: [null, Validators.required],
      accredited: [null /*Validators.required*/],
      completed: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      expiry: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      notes: [null, Validators.maxLength(500)],
    });
    this.form.controls.completed.setValidators([
      // this.dateRequired,
      DateValidator.dateValid(),
      this.pastDateValidator,
      this.minDateValidator(moment().subtract(100, 'years')),
    ]);
    this.form.controls.expiry.setValidators([
      DateValidator.dateValid(),
      this.pastDateValidator,
      this.minDateValidator(moment().subtract(100, 'years')),
    ]);
    this.form.setValidators([this.expiryDateValidator]);

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
    });
  }

  submitHandler() {
    this.submitted = true;
    console.log(this.form.getRawValue());

    console.log(this.form.errors);

    if (this.form.valid) {
    }
  }

  dateRequired(group: FormGroup): ValidationErrors {
    const { day, month, year } = group.controls;

    if (!(day.value && month.value && year.value)) {
      return { required: true };
    }

    return null;
  }

  minDateValidator(minDate: moment.Moment): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const { day, month, year } = group.controls;

      if (day.value && month.value && year.value) {
        const date = moment()
          .year(year.value)
          .month(month.value - 1)
          .date(day.value);

        if (date.isValid()) {
          return date.isAfter(minDate) ? null : { minDate: true };
        }
      }

      return null;
    };
  }

  pastDateValidator(group: FormGroup): ValidationErrors {
    const { day, month, year } = group.controls;

    if (day.value && month.value && year.value) {
      const date = moment()
        .year(year.value)
        .month(month.value - 1)
        .date(day.value);

      if (date.isValid()) {
        return date.isBefore(moment()) ? null : { pastDate: true };
      }
    }

    return null;
  }

  expiryDateValidator(group: FormGroup): ValidationErrors {
    const completed = group.get('completed') as FormGroup;
    const expiry = group.get('expiry') as FormGroup;

    if (
      expiry.controls.day.value &&
      expiry.controls.month.value &&
      expiry.controls.year.value &&
      completed.controls.day.value &&
      completed.controls.month.value &&
      completed.controls.year.value
    ) {
      const completedDate = moment()
        .year(completed.controls.year.value)
        .month(completed.controls.month.value - 1)
        .date(completed.controls.day.value);
      const expiryDate = moment()
        .year(expiry.controls.year.value)
        .month(expiry.controls.month.value - 1)
        .date(expiry.controls.day.value);
      if (completedDate.isValid() && expiryDate.isValid()) {
        return completedDate.isBefore(expiryDate) ? null : { expiryBeforeCompleted: true };
      }
    }
    return null;
  }
}
