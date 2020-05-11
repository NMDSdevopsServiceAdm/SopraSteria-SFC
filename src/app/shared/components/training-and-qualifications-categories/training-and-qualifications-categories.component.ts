import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-training-and-qualifications-categories',
  templateUrl: './training-and-qualifications-categories.component.html',
})
export class TrainingAndQualificationsCategoriesComponent implements OnInit {
  @Input() workplace: Establishment;

  @Output() viewTrainingByCategory: EventEmitter<boolean> = new EventEmitter();

  public trainingCategories: Array<any>;
  public workerDetails = [];
  public workerDetailsLabel = [];
  public canEditWorker = false;

  constructor(
    private permissionsService: PermissionsService,
    private trainingCategoryService: TrainingCategoryService,
    private trainingStatusService: TrainingStatusService,
  ) {}

  ngOnInit() {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');

    this.trainingCategoryService.getCategoriesWithTraining(this.workplace.id).subscribe((trainingCategories) => {
      this.trainingCategories = orderBy(trainingCategories, [
          (tc) => this.trainingStatusCount(tc.training, this.trainingStatusService.EXPIRED),
          (tc) => this.trainingStatusCount(tc.training, this.trainingStatusService.EXPIRING),
          (tc) => this.trainingStatusCount(tc.training, this.trainingStatusService.MISSING),
        ], ['desc', 'desc', 'desc']
      );
    });
  }

  public orderByTrainingStatus(training: Array<any>) {
    return orderBy(training, record => this.trainingStatus(record), ['desc']);
  }

  public toggleDetails(id, event) {
    event.preventDefault();

    this.workerDetails[id] = !this.workerDetails[id];
    this.workerDetailsLabel[id] = this.workerDetailsLabel[id] === 'Less' ? 'More' : 'Less';
  }

  public totalTrainingRecords(training) {
    return training.filter((trainingRecord) => {
      return this.trainingStatus(trainingRecord) !== this.trainingStatusService.MISSING;
    }).length;
  }

  public trainingStatus(trainingRecord) {
    return this.trainingStatusService.getTrainingStatus(trainingRecord.expires, trainingRecord.missing);
  }

  public trainingStatusCount(training, status) {
    return training.filter((trainingRecord) => {
        return this.trainingStatus(trainingRecord) === status;
    }).length;
  }
}
