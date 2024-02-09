import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Establishment, SortTrainingAndQualsOptionsCat } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-and-qualifications-categories',
  templateUrl: './training-and-qualifications-categories.component.html',
})
export class TrainingAndQualificationsCategoriesComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() trainingCategories: Array<any>;
  @Input() totalTraining: number;
  @Input() sortByValue: string;

  @Output() changeTrainingSortBy = new EventEmitter<{ section: string; sortByValue: string }>();

  public workerDetails = [];
  public workerDetailsLabel = [];
  public sortTrainingAndQualsOptions;
  public showMandatoryTraining = false;
  public mandatoryTrainingCount = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    protected trainingStatusService: TrainingStatusService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.getMandatoryTrainingCount();
    this.sortTrainingAndQualsOptions = SortTrainingAndQualsOptionsCat;

    this.orderTrainingCategories(this.sortByValue);
    this.setExpiresSoonAlertDates();
  }

  private getMandatoryTrainingCount(): void {
    this.trainingCategories.forEach((trainingCategory) => {
      if (trainingCategory.isMandatory) {
        this.mandatoryTrainingCount += 1;
      }
    });
  }

  private setExpiresSoonAlertDates(): void {
    this.subscriptions.add(
      this.establishmentService.getExpiresSoonAlertDates(this.workplace.uid).subscribe((date) => {
        this.trainingStatusService.expiresSoonAlertDate$.next(date.expiresSoonAlertDate);
      }),
    );
  }

  public toggleCheckbox(target: HTMLInputElement): void {
    this.showMandatoryTraining = target.checked;
  }

  public orderTrainingCategories(dropdownValue: string): void {
    let sortValue: number;
    if (dropdownValue.includes('missing')) {
      sortValue = this.trainingStatusService.MISSING;
    } else if (dropdownValue.includes('expired')) {
      sortValue = this.trainingStatusService.EXPIRED;
    } else if (dropdownValue.includes('expires_soon')) {
      sortValue = this.trainingStatusService.EXPIRING;
    }
    if (dropdownValue === 'category') {
      this.trainingCategories = orderBy(this.trainingCategories, [(tc) => tc.category.toLowerCase()], ['asc']);
    } else {
      this.trainingCategories = orderBy(
        this.trainingCategories,
        [
          (tc) => this.trainingStatusService.trainingStatusCount(tc.training, sortValue),
          (tc) => tc.category.toLowerCase(),
        ],
        ['desc', 'asc'],
      );
    }
    this.changeTrainingSortBy.emit({ section: 'training-summary', sortByValue: dropdownValue });
  }

  public toggleDetails(id, event): void {
    event.preventDefault();

    this.workerDetails[id] = !this.workerDetails[id];
    this.workerDetailsLabel[id] = this.workerDetailsLabel[id] === 'Close' ? 'Open' : 'Close';
  }

  public totalTrainingRecords(training) {
    return training.filter((trainingRecord) => {
      return this.trainingStatus(trainingRecord) !== this.trainingStatusService.MISSING;
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

  public trainingStatus(training) {
    return this.trainingStatusService.trainingStatusForRecord(training);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
