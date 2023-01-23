import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';

import { AddEditTrainingDirective } from '../../../shared/directives/add-edit-training/add-edit-training.directive';

@Component({
  selector: 'app-add-edit-training',
  templateUrl: '../../../shared/directives/add-edit-training/add-edit-training.component.html',
})
export class AddEditTrainingComponent extends AddEditTrainingDirective implements OnInit, AfterViewInit {
  public mandatoryTraining: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
  ) {
    super(
      formBuilder,
      route,
      router,
      backLinkService,
      errorSummaryService,
      trainingService,
      workerService,
      alertService,
    );
  }

  protected init(): void {
    this.trainingService.trainingOrQualificationPreviouslySelected = 'training';
    this.mandatoryTraining = history.state?.training;
    this.worker = this.workerService.worker;
    if (this.route.snapshot.params.data) {
      this.form.patchValue({
        category: this.route.snapshot.params.data,
      });
    }
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    if (this.trainingRecordId) {
      this.fillForm();
    }
  }

  public setTitle(): void {
    if (this.mandatoryTraining) {
      this.title = this.trainingRecordId ? 'Mandatory training record' : 'Add mandatory training record';
    } else {
      this.title = this.trainingRecordId ? 'Training details' : 'Add training record details';
    }
  }

  protected setButtonText(): void {
    this.buttonText = this.trainingRecordId ? 'Save and return' : 'Save record';
  }

  private fillForm(): void {
    this.subscriptions.add(
      this.workerService.getTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId).subscribe(
        (trainingRecord) => {
          if (trainingRecord) {
            this.trainingRecord = trainingRecord;

            const completed = this.trainingRecord.completed
              ? dayjs(this.trainingRecord.completed, DATE_PARSE_FORMAT)
              : null;
            const expires = this.trainingRecord.expires ? dayjs(this.trainingRecord.expires, DATE_PARSE_FORMAT) : null;

            this.form.patchValue({
              title: this.trainingRecord.title,
              category: this.trainingRecord.trainingCategory.id,
              accredited: this.trainingRecord.accredited,
              ...(completed && {
                completed: {
                  day: completed.date(),
                  month: completed.format('M'),
                  year: completed.year(),
                },
              }),
              ...(expires && {
                expires: {
                  day: expires.date(),
                  month: expires.format('M'),
                  year: expires.year(),
                },
              }),
              notes: this.trainingRecord.notes,
            });
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  protected submit(record: any): void {
    if (this.trainingRecordId) {
      this.subscriptions.add(
        this.workerService
          .updateTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId, record)
          .subscribe(
            () => this.onSuccess(),
            (error) => this.onError(error),
          ),
      );
    } else {
      this.subscriptions.add(
        this.workerService.createTrainingRecord(this.workplace.uid, this.worker.uid, record).subscribe(
          () => this.onSuccess(),
          (error) => this.onError(error),
        ),
      );
    }
  }

  private onSuccess() {
    const trainingCategoryId = localStorage.getItem('trainingCategoryId');

    let url: string[];
    if (trainingCategoryId) {
      url = [
        `/workplace/${this.workplace.uid}/training-and-qualifications-record/view-training-category/${trainingCategoryId}`,
      ];

      this.router.navigate(url).then(() => {
        if (this.mandatoryTraining) {
          this.alertService.addAlert({
            type: 'success',
            message: 'Mandatory training record added',
          });
        } else {
          this.alertService.addAlert({
            type: 'success',
            message: 'Training record updated',
          });
        }

        localStorage.removeItem('trainingCategoryId');
      });
    } else {
      url = [`workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}/training`];

      this.router.navigate(url).then(() => {
        if (this.trainingRecordId) {
          this.workerService.alert = { type: 'success', message: 'Training has been saved.' };
        } else {
          this.workerService.alert = { type: 'success', message: 'Training has been added.' };
        }
      });
    }
  }

  private onError(error) {
    console.log(error);
  }
}
