import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
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
  private trainingPath: string;
  public mandatoryTraining: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
  ) {
    super(formBuilder, route, router, backService, errorSummaryService, trainingService, workerService);
  }

  protected init(): void {
    this.mandatoryTraining = history.state?.training;
    this.worker = this.workerService.worker;

    this.workerService.getRoute$.subscribe((route) => {
      if (route) {
        this.previousUrl = [route];
      } else {
        this.previousUrl = [
          `workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}/new-training`,
        ];
      }
    });
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;

    if (this.trainingRecordId) {
      this.fillForm();
    }
  }

  public setTitle(): void {
    if (this.mandatoryTraining) {
      this.title = this.trainingRecordId ? 'Mandatory training record' : 'Add mandatory training record';
    } else {
      this.title = this.trainingRecordId ? 'Training details' : 'Enter training details';
    }
  }

  protected setButtonText(): void {
    this.buttonText = this.trainingRecordId ? 'Save and return' : 'Add training';
  }

  protected setBackLink(): void {
    const parsed = this.router.parseUrl(this.previousUrl[0]);
    this.backService.setBackLink({
      url: [parsed.root.children.primary.segments.map((seg) => seg.path).join('/')],
      fragment: parsed.fragment,
      queryParams: parsed.queryParams,
    });
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
    let url: string[];
    if (this.previousUrl.indexOf('dashboard') > -1) {
      url = this.previousUrl;
    } else {
      url = [`/workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}/new-training`];
    }
    this.router.navigate(url).then(() => {
      if (this.trainingRecordId) {
        this.workerService.alert = { type: 'success', message: 'Training has been saved.' };
      } else {
        this.workerService.alert = { type: 'success', message: 'Training has been added.' };
      }
    });
  }

  private onError(error) {
    console.log(error);
  }
}
