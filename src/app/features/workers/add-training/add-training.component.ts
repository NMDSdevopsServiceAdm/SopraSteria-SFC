import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainingCategory, TrainingRecordRequest } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@core/validators/date.validator';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-add-training',
  templateUrl: './add-training.component.html',
})
export class AddTrainingComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public categories: TrainingCategory[];
  public worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private trainingService: TrainingService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      category: [null, Validators.required],
      accredited: null,
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
      DateValidator.dateValid(),
      this.pastDateValidator,
      this.minDateValidator(moment().subtract(100, 'years')),
    ]);
    this.form.controls.expiry.setValidators([
      DateValidator.dateValid(),
      this.minDateValidator(moment().subtract(100, 'years')),
    ]);
    this.form.setValidators([this.expiryDateValidator]);

    this.subscriptions.add(
      this.trainingService.getCategories().subscribe(categories => {
        this.categories = categories;
      })
    );

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
    });
  }

  async submitHandler() {
    this.submitted = true;

    if (this.form.valid) {
      try {
        this.saveHandler();
        this.workerService.setTrainingRecordCreated();
        this.router.navigate(['/worker', this.worker.uid], {
          fragment: 'qualifications-and-training',
        });
      } catch (err) {}
    }
  }

  saveHandler(): Promise<any> {
    return new Promise((resolve, reject) => {
      const { name, category, accredited, completed, expiry, notes } = this.form.controls;

      const completedDate = this.dateGroupToMoment(completed as FormGroup);
      const expiryDate = this.dateGroupToMoment(expiry as FormGroup);

      const record: TrainingRecordRequest = {
        trainingCategory: {
          id: parseInt(category.value, 10),
        },
        title: name.value,
        accredited: accredited.value,
        completed: completedDate ? completedDate.toISOString() : null,
        expires: expiryDate ? expiryDate.toISOString() : null,
        notes: notes.value,
      };

      this.subscriptions.add(
        this.workerService.createTrainingRecord(this.worker.uid, record).subscribe(resolve, reject)
      );
    });
  }

  dateGroupToMoment(group: FormGroup): moment.Moment {
    const { day, month, year } = group.controls;

    return day.value && month.value && year.value
      ? moment()
          .year(year.value)
          .month(month.value - 1)
          .date(day.value)
      : null;
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

    if (expiry.controls.day.value && expiry.controls.month.value && expiry.controls.year.value) {
      if (completed.controls.day.value && completed.controls.month.value && completed.controls.year.value) {
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
      } else {
        return { completedRequired: true };
      }
    }
    return null;
  }
}
