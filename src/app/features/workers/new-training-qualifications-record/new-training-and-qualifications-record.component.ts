import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment, FilterTrainingAndQualsOptions } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { MandatoryTraining, TrainingRecordCategory, TrainingRecords } from '@core/model/training.model';
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
  public jobRoleMandatoryTraining: MandatoryTraining[];
  public missingJobRoleMandatoryTrainingCount: number;
  private subscriptions: Subscription = new Subscription();
  private currentUrl: string;
  public filterTrainingByStatus;
  public filterTrainingByDefault: string;
  public filterTraining;
  public allTrainings;

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private trainingStatusService: TrainingStatusService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    this.trainingStatusService.expiresSoonAlertDate$.next(
      this.route.snapshot.data.expiresSoonAlertDate.expiresSoonAlertDate,
    );
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
    this.setTrainingAndQualifications();
    this.subscriptions.add(
      this.workerService.alert$.subscribe((alert) => {
        if (alert) {
          this.alertService.addAlert(alert);
          this.workerService.alert = null;
        }
      }),
    );
    this.currentUrl = this.router.url;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');

    this.filterTrainingByDefault = '0_showall';
    this.filterTrainingByStatus = FilterTrainingAndQualsOptions;
    this.getFilterByStatus(this.filterTrainingByDefault);
  }

  public setTrainingAndQualifications(): void {
    this.qualificationsByGroup = this.route.snapshot.data.trainingAndQualificationRecords.qualifications;
    this.qualificationsCount = this.qualificationsByGroup.count;
    const trainingRecords = this.route.snapshot.data.trainingAndQualificationRecords.training;
    this.filterTraining = this.allTrainings = trainingRecords;
    this.setTraining(trainingRecords.mandatory, trainingRecords.nonMandatory);
    this.expiredTraining = this.getTrainingStatusCount(trainingRecords, this.trainingStatusService.EXPIRED);
    this.expiresSoonTraining = this.getTrainingStatusCount(trainingRecords, this.trainingStatusService.EXPIRING);
    this.getLastUpdatedDate([this.qualificationsByGroup?.lastUpdated, trainingRecords?.lastUpdated]);
    this.jobRoleMandatoryTraining = trainingRecords.jobRoleMandatoryTraining;
    this.missingJobRoleMandatoryTrainingCount = this.getMissingMandatoryTrainingCount();
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
      if (type !== 'lastUpdated' && type !== 'jobRoleMandatoryTraining') {
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

  private getMissingMandatoryTrainingCount(): number {
    let count = this.jobRoleMandatoryTraining.length;

    if (this.mandatoryTraining.length > 0) {
      this.jobRoleMandatoryTraining.forEach((jobRoleTraining) => {
        this.mandatoryTraining.some((training) => {
          jobRoleTraining.category === training.category && count--;
        });
      });
    }
    return count;
  }

  getFilterByStatus(dropdownValue) {
    if (dropdownValue === '0_showall') {
      this.nonMandatoryTraining = this.allTrainings.nonMandatory;
      this.mandatoryTraining = this.allTrainings.mandatory;
      return;
    }

    const filterValue = dropdownValue === '1_expired' ? 3 : 1;
    this.filterTraining = this.allTrainings;
    const mandatory = this.filterNonMandatoryAndMandatoryByStatus(filterValue, this.filterTraining.mandatory);
    const nonMandatory = this.filterNonMandatoryAndMandatoryByStatus(filterValue, this.filterTraining.nonMandatory);

    this.filterTraining = { mandatory, nonMandatory };
    this.nonMandatoryTraining = nonMandatory;
    this.mandatoryTraining = mandatory;
  }

  private filterNonMandatoryAndMandatoryByStatus(filterValue, trainings) {
    const filteredTrainings = [];
    trainings.filter((training) => {
      this.pushMandatoryAndNonMandatoryInArray(training, filterValue, filteredTrainings);
    });
    return filteredTrainings;
  }

  private pushMandatoryAndNonMandatoryInArray(training, filterValue, arrayTraining) {
    const filterdStatus = training.trainingRecords.filter((status) => status.trainingStatus === filterValue);
    if (filterdStatus && filterdStatus.length) {
      arrayTraining.push({
        category: training.category,
        id: training.id,
        trainingRecords: filterdStatus,
      });
    }
  }

  private sortTrainingAlphabetically(training: TrainingRecordCategory[]) {
    return training.sort((categoryA, categoryB) =>
      categoryA.category !== categoryB.category ? (categoryA.category < categoryB.category ? -1 : 1) : 0,
    );
  }

  public setReturnRoute(): void {
    this.workerService.getRoute$.next(this.currentUrl);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
