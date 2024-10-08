import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';

import { AddEditTrainingDirective } from '../../../shared/directives/add-edit-training/add-edit-training.directive';
import { TrainingCategoryService } from '@core/services/training-category.service';

@Component({
  selector: 'app-add-edit-training',
  templateUrl: '../../../shared/directives/add-edit-training/add-edit-training.component.html',
})
export class AddEditTrainingComponent extends AddEditTrainingDirective implements OnInit, AfterViewInit {
  public category: string;
  public establishmentUid: string;
  public workerId: string;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected trainingCategoryService: TrainingCategoryService,
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
      trainingCategoryService,
      workerService,
      alertService,
    );
  }

  protected init(): void {
    this.trainingService.trainingOrQualificationPreviouslySelected = 'training';
    this.worker = this.workerService.worker;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    if (this.trainingRecordId) {
      this.fillForm();
    } else if (this.trainingCategory) {
      this.category = this.trainingCategory.category;
      this.form.patchValue({
        category: this.trainingCategory.id,
      });
    }

    this.establishmentUid = this.route.snapshot.params?.establishmentuid;
    this.workerId = this.route.snapshot.params?.id;

    if (!this.trainingCategory && !this.trainingRecordId) {
      this.router.navigate([
        `workplace/${this.establishmentUid}/training-and-qualifications-record/${this.workerId}/add-training`,
      ]);
      return;
    }
  }

  public setTitle(): void {
    this.title = this.trainingRecordId ? 'Training record details' : 'Add training record details';
  }

  protected setSectionHeading(): void {
    this.section = this.worker.nameOrId;
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
            this.category = trainingRecord.trainingCategory.category;
            this.trainingCategory = trainingRecord.trainingCategory;

            const completed = this.trainingRecord.completed
              ? dayjs(this.trainingRecord.completed, DATE_PARSE_FORMAT)
              : null;
            const expires = this.trainingRecord.expires ? dayjs(this.trainingRecord.expires, DATE_PARSE_FORMAT) : null;
            this.form.patchValue({
              title: this.trainingRecord.title,
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
    this.trainingService.clearSelectedTrainingCategory();
    const message = this.trainingRecordId ? 'Training record updated' : 'Training record added';

    this.router.navigate(this.previousUrl).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: message,
      });
    });
  }

  private onError(error) {
    console.log(error);
  }
}
