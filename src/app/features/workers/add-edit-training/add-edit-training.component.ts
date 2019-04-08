import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCategory, TrainingRecord, TrainingRecordRequest } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@core/validators/date.validator';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-training',
  templateUrl: './add-edit-training.component.html',
})
export class AddEditTrainingComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public categories: TrainingCategory[];
  public trainingRecord: TrainingRecord;
  public trainingRecordId: string;
  public worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private trainingService: TrainingService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.worker = this.workerService.worker;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordid;

    this.form = this.formBuilder.group({
      title: [null, Validators.required],
      category: [null, Validators.required],
      accredited: null,
      completed: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      expires: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      notes: [null, Validators.maxLength(1000)],
    });
    this.form.controls.completed.setValidators([
      DateValidator.dateValid(),
      this.pastDateValidator,
      this.minDateValidator(moment().subtract(100, 'years')),
    ]);
    this.form.controls.expires.setValidators([
      DateValidator.dateValid(),
      this.minDateValidator(moment().subtract(100, 'years')),
    ]);
    this.form.setValidators([this.expiresDateValidator]);

    this.subscriptions.add(
      this.trainingService.getCategories().subscribe(categories => {
        this.categories = categories;
      })
    );

    if (this.trainingRecordId) {
      this.subscriptions.add(
        this.workerService.getTrainingRecord(this.worker.uid, this.trainingRecordId).subscribe(trainingRecord => {
          this.trainingRecord = trainingRecord;

          const completed = this.trainingRecord.completed ? moment(this.trainingRecord.completed) : null;
          const expires = this.trainingRecord.expires ? moment(this.trainingRecord.expires) : null;

          this.form.patchValue({
            title: this.trainingRecord.title,
            category: this.trainingRecord.trainingCategory.id,
            accredited: this.trainingRecord.accredited,
            ...(completed && {
              completed: {
                day: completed.date(),
                month: completed.month() + 1,
                year: completed.year(),
              },
            }),
            ...(expires && {
              expires: {
                day: expires.date(),
                month: expires.month() + 1,
                year: expires.year(),
              },
            }),
            notes: this.trainingRecord.notes,
          });
        })
      );
    }
  }

  async submitHandler() {
    this.submitted = true;

    if (this.form.valid) {
      try {
        await this.saveHandler();
        if (this.trainingRecordId) {
          this.workerService.setTrainingRecordEdited();
        } else {
          this.workerService.setTrainingRecordCreated();
        }
        this.router.navigate(['/worker', this.worker.uid], {
          fragment: 'qualifications-and-training',
        });
      } catch (err) {}
    }
  }

  saveHandler(): Promise<any> {
    return new Promise((resolve, reject) => {
      const { title, category, accredited, completed, expires, notes } = this.form.controls;

      const completedDate = this.dateGroupToMoment(completed as FormGroup);
      const expiresDate = this.dateGroupToMoment(expires as FormGroup);

      const record: TrainingRecordRequest = {
        trainingCategory: {
          id: parseInt(category.value, 10),
        },
        title: title.value,
        accredited: accredited.value,
        completed: completedDate ? completedDate.toISOString() : null,
        expires: expiresDate ? expiresDate.toISOString() : null,
        notes: notes.value,
      };

      if (this.trainingRecordId) {
        this.subscriptions.add(
          this.workerService
            .updateTrainingRecord(this.worker.uid, this.trainingRecordId, record)
            .subscribe(resolve, reject)
        );
      } else {
        this.subscriptions.add(
          this.workerService.createTrainingRecord(this.worker.uid, record).subscribe(resolve, reject)
        );
      }
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

  expiresDateValidator(group: FormGroup): ValidationErrors {
    const completed = group.get('completed') as FormGroup;
    const expires = group.get('expires') as FormGroup;

    if (expires.controls.day.value && expires.controls.month.value && expires.controls.year.value) {
      if (completed.controls.day.value && completed.controls.month.value && completed.controls.year.value) {
        const completedDate = moment()
          .year(completed.controls.year.value)
          .month(completed.controls.month.value - 1)
          .date(completed.controls.day.value);
        const expiresDate = moment()
          .year(expires.controls.year.value)
          .month(expires.controls.month.value - 1)
          .date(expires.controls.day.value);

        if (completedDate.isValid() && expiresDate.isValid()) {
          return completedDate.isBefore(expiresDate) ? null : { expiresBeforeCompleted: true };
        }
      } else {
        return { completedRequired: true };
      }
    }
    return null;
  }
}
