import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-training-and-qualifications-record',
  templateUrl: './new-training-and-qualifications-record.component.html',
  styleUrls: ['./new-training-and-qualification.component.scss'],
})
export class NewTrainingAndQualificationsRecordComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  protected currentFragment: string;
  public canEditWorker: boolean;
  public canViewWorker: boolean;
  public worker: Worker;
  public workplace: Establishment;
  public mandatoryTrainingCount: number;
  public nonMandatoryTrainingCount: number;
  public nonMandatoryTraining: TrainingRecordCategory[];
  public mandatoryTraining: TrainingRecordCategory[];
  public qualificationsByGroup: QualificationsByGroup;
  public lastUpdatedDate: Date;
  public fragmentsObject: any = {
    allRecords: 'all-records',
    mandatoryTraining: 'mandatory-training',
    nonMandatoryTraining: 'non-mandatory-training',
    qualifications: 'qualifications',
  };
  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private trainingStatusService: TrainingStatusService,
    private trainingService: TrainingService,
  ) {}

  public ngOnInit(): void {
    this.setPageData();
    this.setBreadcrumbs();
    this.setUpTabSubscription();
    this.updateTrainingExpiresSoonDate();
    this.updateTrainingExpiresSoonDate();
    this.setTrainingAndQualifications();
    this.setUpAlertSubscription();
    this.setReturnRoute();
  }

  private setPageData(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    this.qualificationsByGroup = this.route.snapshot.data.trainingAndQualificationRecords.qualifications;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.trainingService.trainingOrQualificationPreviouslySelected = null;
  }

  private setBreadcrumbs(): void {
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
  }

  private setUpTabSubscription(): void {
    this.subscriptions.add(
      this.route.fragment.subscribe((fragment) => {
        this.currentFragment = fragment ? fragment : 'all-records';
      }),
    );
  }

  private updateTrainingExpiresSoonDate(): void {
    this.trainingStatusService.expiresSoonAlertDate$.next(
      this.route.snapshot.data.expiresSoonAlertDate.expiresSoonAlertDate,
    );
  }

  private setUpAlertSubscription(): void {
    this.subscriptions.add(
      this.workerService.alert$.subscribe((alert) => {
        if (alert) {
          this.alertService.addAlert(alert);
          this.workerService.alert = null;
        }
      }),
    );
  }

  public setTrainingAndQualifications(): void {
    const trainingRecords = this.route.snapshot.data.trainingAndQualificationRecords.training;
    this.setTraining(trainingRecords.mandatory, trainingRecords.nonMandatory);
    this.getLastUpdatedDate([this.qualificationsByGroup?.lastUpdated, trainingRecords?.lastUpdated]);
  }

  private setTraining(
    mandatoryTrainingRecords: TrainingRecordCategory[],
    nonMandatoryTrainingRecords: TrainingRecordCategory[],
  ): void {
    this.mandatoryTraining = this.sortTrainingAlphabetically(mandatoryTrainingRecords);
    this.nonMandatoryTraining = this.sortTrainingAlphabetically(nonMandatoryTrainingRecords);

    this.mandatoryTrainingCount = this.getTrainingCount(this.mandatoryTraining);
    this.nonMandatoryTrainingCount = this.getTrainingCount(this.nonMandatoryTraining);

    this.getStatus(this.mandatoryTraining);
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

  private sortTrainingAlphabetically(training: TrainingRecordCategory[]): TrainingRecordCategory[] {
    return training.sort((categoryA, categoryB) =>
      categoryA.category !== categoryB.category ? (categoryA.category < categoryB.category ? -1 : 1) : 0,
    );
  }

  public setReturnRoute(): void {
    this.workerService.setReturnTo({
      url: [this.router.url],
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
