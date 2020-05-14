import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import orderBy from 'lodash/orderBy';

@Component({
  selector: 'app-training-and-qualifications-categories',
  templateUrl: './training-and-qualifications-categories.component.html',
})
export class TrainingAndQualificationsCategoriesComponent implements OnInit {
  @Input() workplace: Establishment;

  @Input() trainingCategories: Array<any>;

  @Input() showViewByToggle = false;

  @Output() viewTrainingByCategory: EventEmitter<boolean> = new EventEmitter();

  public workerDetails = [];
  public workerDetailsLabel = [];
  public canEditWorker = false;

  constructor(
    private permissionsService: PermissionsService,

    protected trainingStatusService: TrainingStatusService,
  ) {}

  ngOnInit() {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');

    this.orderTrainingCategories();
  }

  public orderTrainingCategories() {
    this.trainingCategories = orderBy(
      this.trainingCategories,
      [
        (tc) => this.trainingStatusService.trainingStatusCount(tc.training, this.trainingStatusService.EXPIRED),
        (tc) => this.trainingStatusService.trainingStatusCount(tc.training, this.trainingStatusService.MISSING),
        (tc) => this.trainingStatusService.trainingStatusCount(tc.training, this.trainingStatusService.EXPIRING),
        (tc) => tc.category,
      ],
      ['desc', 'desc', 'desc', 'asc'],
    );
  }

  public orderByTrainingStatusAndName(training: Array<any>) {
    return orderBy(
      training,
      [
        (trainingRecord) => this.trainingStatusService.trainingStatusForRecord(trainingRecord),
        (trainingRecord) => trainingRecord.worker.NameOrIdValue,
      ],
      ['desc', 'asc'],
    );
  }

  public toggleDetails(id, event) {
    event.preventDefault();

    this.workerDetails[id] = !this.workerDetails[id];
    this.workerDetailsLabel[id] = this.workerDetailsLabel[id] === 'Less' ? 'More' : 'Less';
  }

  public totalTrainingRecords(training) {
    return training.filter((trainingRecord) => {
      return this.trainingStatusService.trainingStatusForRecord(trainingRecord) !== this.trainingStatusService.MISSING;
    }).length;
  }

  public trainingIsComplete(training) {
    return (
      [
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.EXPIRED),
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.EXPIRING),
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.MISSING),
      ].reduce((total, num) => {
        return total + num;
      }) === 0
    );
  }
}
