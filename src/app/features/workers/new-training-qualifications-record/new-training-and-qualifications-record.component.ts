import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment, mandatoryTraining } from '@core/model/establishment.model';
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
  @ViewChild('tabEl') tabEl;
  private subscriptions: Subscription = new Subscription();
  public actionsListData = [];
  public currentFragment: string;
  public filteredToJobRoleMandatoryTraining: mandatoryTraining[];
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
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private trainingStatusService: TrainingStatusService,
    private trainingService: TrainingService,
    private workerService: WorkerService,
    private alertService: AlertService,
  ) {}

  public ngOnInit(): void {
    const alertMessage = history.state?.alertMessage;
    alertMessage && this.showAlert(alertMessage);

    this.setPageData();
    this.setBreadcrumbs();
    this.setUpTabSubscription();
    this.updateTrainingExpiresSoonDate();
    this.updateTrainingExpiresSoonDate();
    this.setTraining();
    this.setUpAlertSubscription();
    this.setReturnRoute();
  }

  private showAlert(message: string): void {
    this.alertService.addAlert({
      type: 'success',
      message,
    });
  }

  private setPageData(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    this.qualificationsByGroup = this.route.snapshot.data.trainingAndQualificationRecords.qualifications;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.trainingService.trainingOrQualificationPreviouslySelected = null;
    this.filteredToJobRoleMandatoryTraining = this.getMandatoryTrainingForStaffJobRole();
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

  private setTraining(): void {
    const trainingRecords = this.route.snapshot.data.trainingAndQualificationRecords.training;
    this.mandatoryTraining = this.createBlankMissingMandatoryTrainings(trainingRecords.mandatory);
    this.sortTrainingAlphabetically(this.mandatoryTraining);
    this.nonMandatoryTraining = this.sortTrainingAlphabetically(trainingRecords.nonMandatory);

    this.mandatoryTrainingCount = this.getTrainingCount(this.mandatoryTraining);
    this.nonMandatoryTrainingCount = this.getTrainingCount(this.nonMandatoryTraining);

    this.getStatus(this.mandatoryTraining);
    this.getStatus(this.nonMandatoryTraining);

    this.populateActionsList(this.mandatoryTraining, 'Mandatory');
    this.populateActionsList(this.nonMandatoryTraining, 'Non-mandatory');

    this.sortActionsList();

    this.getLastUpdatedDate([this.qualificationsByGroup?.lastUpdated, trainingRecords?.lastUpdated]);
  }

  private createBlankMissingMandatoryTrainings(mandatoryTraining: TrainingRecordCategory[]) {
    const trainingCategoryIds = this.getMandatoryTrainingIds(mandatoryTraining);
    const missingMandatoryTrainings = this.filterTrainingCategoriesWhereTrainingExists(trainingCategoryIds);
    missingMandatoryTrainings.forEach((missingMandatoryTraining) => {
      mandatoryTraining.push({
        category: missingMandatoryTraining.category,
        id: missingMandatoryTraining.trainingCategoryId,
        trainingRecords: [
          {
            trainingCategory: {
              id: missingMandatoryTraining.trainingCategoryId,
              category: missingMandatoryTraining.category,
            },
            created: null,
            title: null,
            uid: null,
            updated: null,
            updatedBy: null,
            expires: null,
            missing: true,
          },
        ],
      });
    });
    return mandatoryTraining;
  }

  private filterTrainingCategoriesWhereTrainingExists(trainingCategoryIds: Array<number>): mandatoryTraining[] {
    return this.filteredToJobRoleMandatoryTraining.filter((mandatoryTraining) => {
      return !trainingCategoryIds.includes(mandatoryTraining.trainingCategoryId);
    });
  }

  private getMandatoryTrainingIds(mandatoryTraining: TrainingRecordCategory[]): Array<number> {
    const trainingCategoryIds = [];
    mandatoryTraining.forEach((trainingCategory) => {
      trainingCategoryIds.push(trainingCategory.id);
    });

    return trainingCategoryIds;
  }

  private getMandatoryTrainingForStaffJobRole(): mandatoryTraining[] {
    return this.route.snapshot.data.mandatoryTrainingCategories.mandatoryTraining.filter(
      (mandatoryTrainingCategory) => {
        return mandatoryTrainingCategory.jobs.some(
          (mandatoryJobRole) => mandatoryJobRole.id === this.worker.mainJob.jobId,
        );
      },
    );
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

  private populateActionsList(trainingCategories: any, typeOfTraining: string): void {
    trainingCategories.forEach((trainingCategory) => {
      trainingCategory.trainingRecords.forEach((trainingRecord) => {
        if (trainingRecord.trainingStatus && trainingRecord.trainingStatus !== 0) {
          this.actionsListData.push({
            ...trainingRecord,
            typeOfTraining: typeOfTraining,
          });
        }
      });
    });
  }

  private sortActionsList(): void {
    this.actionsListData.sort(function (a, b) {
      const optionsList = [a, b];
      const sortValueArray = [];
      for (let index = 0; index < optionsList.length; index++) {
        switch (optionsList[index].trainingStatus) {
          case 2: //MISSING
            sortValueArray[index] = 2;
            break;
          case 1: //EXPIRING
            sortValueArray[index] = 1;
            break;
          case 3: //EXPIRED
            sortValueArray[index] = 0;
            break;
        }
      }
      return sortValueArray[0] - sortValueArray[1];
    });
  }

  public actionsListNavigate(actionListItem): void {
    const url = actionListItem.uid
      ? [
          'workplace',
          this.workplace.uid,
          'training-and-qualifications-record',
          this.worker.uid,
          'training',
          actionListItem.uid,
          { trainingCategory: JSON.stringify(actionListItem.trainingCategory) },
        ]
      : [
          'workplace',
          this.workplace.uid,
          'training-and-qualifications-record',
          this.worker.uid,
          'add-training',
          { trainingCategory: JSON.stringify(actionListItem.trainingCategory) },
        ];
    this.router.navigate(url);
  }

  private sortTrainingAlphabetically(training: TrainingRecordCategory[]): TrainingRecordCategory[] {
    return training.sort((categoryA, categoryB) =>
      categoryA.category !== categoryB.category ? (categoryA.category < categoryB.category ? -1 : 1) : 0,
    );
  }

  public navigateToNewTab(fragmentString): void {
    this.router
      .navigate(['workplace', this.workplace.uid, 'training-and-qualifications-record', this.worker.uid, 'training'], {
        fragment: fragmentString,
      })
      .then(() => {
        this.tabEl.nativeElement.scrollIntoView();
      });
  }

  public setReturnRoute(): void {
    localStorage.setItem(
      'previousUrl',
      this.router.url.includes('#') ? this.router.url.slice(0, this.router.url.indexOf('#')) : this.router.url,
    );
  }

  public navigateToLongTermAbsence(): void {
    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'long-term-absence',
      { returnToTrainingAndQuals: 'true' },
    ]);
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
