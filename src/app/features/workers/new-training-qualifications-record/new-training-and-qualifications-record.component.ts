import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { TrainingRecordCategory, TrainingRecords } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-training-and-qualifications-record',
  templateUrl: './new-training-and-qualifications-record.component.html',
})
export class NewTrainingAndQualificationsRecordComponent implements OnInit, OnDestroy {
  public canEditWorker: boolean;
  public canViewWorker: boolean;
  public worker: Worker;
  public workplace: Establishment;
  public trainingAndQualsCount: number;
  public trainingAlert: number;
  public qualificationsCount: number;
  public mandatoryTrainingCount: number;
  public nonMandatoryTrainingCount: number;
  public nonMandatoryTraining: TrainingRecordCategory[];
  public mandatoryTraining: TrainingRecordCategory[];
  public qualificationsByGroup: QualificationsByGroup;
  public expiredTraining: number;
  public expiresSoonTraining: number;
  public lastUpdatedDate: Date;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private trainingStatusService: TrainingStatusService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
    this.setTrainingAndQualifications();
    this.setReturnTo();
    this.subscriptions.add(
      this.workerService.alert$.subscribe((alert) => {
        if (alert) {
          this.alertService.addAlert(alert);
          this.workerService.alert = null;
        }
      }),
    );
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
  }

  public setTrainingAndQualifications(): void {
    this.qualificationsByGroup = this.route.snapshot.data.trainingAndQualificationRecords.qualifications;
    this.qualificationsCount = this.qualificationsByGroup.count;
    const trainingRecords = this.route.snapshot.data.trainingAndQualificationRecords.training;

    this.setTraining(trainingRecords.mandatory, trainingRecords.nonMandatory);
    this.expiredTraining = this.getTrainingStatusCount(trainingRecords, this.trainingStatusService.EXPIRED);
    this.expiresSoonTraining = this.getTrainingStatusCount(trainingRecords, this.trainingStatusService.EXPIRING);
    this.getLastUpdatedDate([this.qualificationsByGroup?.lastUpdated, trainingRecords?.lastUpdated]);
  }

  private setTraining(
    mandatoryTrainingRecords: TrainingRecordCategory[],
    nonMandatoryTrainingRecords: TrainingRecordCategory[],
  ): void {
    this.mandatoryTraining = this.sortTrainingAlphabetically(mandatoryTrainingRecords);
    this.mandatoryTrainingCount = this.getTrainingCount(this.mandatoryTraining);
    this.getStatus(this.mandatoryTraining);
    this.nonMandatoryTraining = this.sortTrainingAlphabetically(nonMandatoryTrainingRecords);
    this.nonMandatoryTrainingCount = this.getTrainingCount(this.nonMandatoryTraining);
    this.getStatus(this.nonMandatoryTraining);
  }

  public getLastUpdatedDate(lastUpdatedDates: Date[]): void {
    const filteredDates = lastUpdatedDates.filter((date) => date);
    this.lastUpdatedDate = filteredDates.reduce((a, b) => (a > b ? a : b), null);
  }

  private getTrainingCount(training: TrainingRecordCategory[]): number {
    let count = 0;
    training.forEach((category) => {
      count += category.trainingRecords.length;
    });
    return count;
  }

  public getTrainingStatusCount(training: TrainingRecords, status: number): number {
    let count = 0;

    const trainingTypes = Object.keys(training);
    trainingTypes.forEach((type) => {
      if (type !== 'lastUpdated') {
        training[type].forEach((category) => {
          category.trainingRecords.forEach((trainingRecord) => {
            if (trainingRecord.trainingStatus === status) {
              count += 1;
            }
          });
        });
      }
    });
    return count;
  }

  private getStatus(categories: TrainingRecordCategory[]): void {
    categories.forEach((category) => {
      category.trainingRecords.forEach((trainingRecord) => {
        trainingRecord.trainingStatus = this.trainingStatusService.getTrainingStatus(
          trainingRecord.expires,
          trainingRecord.missing,
        );
      });
    });
  }

  private sortTrainingAlphabetically(training: TrainingRecordCategory[]) {
    return training.sort((categoryA, categoryB) =>
      categoryA.category !== categoryB.category ? (categoryA.category < categoryB.category ? -1 : 1) : 0,
    );
  }

  private setReturnTo(): void {
    const returnToRecord = {
      url: ['/workplace', this.workplace.uid, 'training-and-qualifications-record', this.worker.uid, 'training'],
    };
    this.workerService.setReturnTo(returnToRecord);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
