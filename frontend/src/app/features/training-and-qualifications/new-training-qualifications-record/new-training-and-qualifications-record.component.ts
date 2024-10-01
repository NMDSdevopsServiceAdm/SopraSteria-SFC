import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment, mandatoryTraining } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { CertificateUpload, TrainingRecord, TrainingRecordCategory, TrainingRecords } from '@core/model/training.model';
import { TrainingAndQualificationRecords } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PdfTrainingAndQualificationService } from '@core/services/pdf-training-and-qualification.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';
import { CustomValidators } from '../../../shared/validators/custom-form-validators';

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
  public pdfCount: number;
  public certificateErrors: Record<string, string> = {}; // {categoryName: errorMessage}

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
    public viewContainerRef: ViewContainerRef,
    private pdfTrainingAndQualificationService: PdfTrainingAndQualificationService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {
    pdfTrainingAndQualificationService.setViewContainer = viewContainerRef;
  }

  public ngOnInit(): void {
    this.setPageData();
    this.breadcrumbService.show(this.getBreadcrumbsJourney());
    this.setUpTabSubscription();
    this.updateTrainingExpiresSoonDate();
    const trainingRecords: TrainingRecords = this.route.snapshot.data.trainingAndQualificationRecords.training;

    this.setTraining(trainingRecords);
    this.setUpAlertSubscription();
    this.setReturnRoute();
    this.getPdfCount();
  }

  public async downloadAsPDF(save: boolean = true) {
    try {
      return await this.pdfTrainingAndQualificationService.BuildTrainingAndQualsPdf(
        this.workplace,
        this.mandatoryTraining,
        this.nonMandatoryTraining,
        this.qualificationsByGroup,
        this.nonMandatoryTrainingCount,
        this.mandatoryTrainingCount,
        this.worker,
        this.lastUpdatedDate,
        this.actionsListData,
        'Training_And_Qualification.pdf',
        save,
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async getPdfCount() {
    const pdf = await this.downloadAsPDF(false);
    const numberOfPages = pdf?.getNumberOfPages();

    return (this.pdfCount = numberOfPages);
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

  public getBreadcrumbsJourney(): JourneyType {
    return this.establishmentService.isOwnWorkplace() || this.parentSubsidiaryViewService.getViewingSubAsParent()
      ? JourneyType.MY_WORKPLACE
      : JourneyType.ALL_WORKPLACES;
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

  private setTraining(trainingRecords: TrainingRecords): void {
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
            trainingCertificates: [],
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
      const trainingRecordsWithoutMissing = category.trainingRecords.filter((record) => record.uid);
      count += trainingRecordsWithoutMissing.length;
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
        ]
      : ['workplace', this.workplace.uid, 'training-and-qualifications-record', this.worker.uid, 'add-training'];
    this.router.navigate(url, { queryParams: { trainingCategory: JSON.stringify(actionListItem.trainingCategory) } });
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
    this.router.navigate(
      ['/workplace', this.workplace.uid, 'training-and-qualifications-record', this.worker.uid, 'long-term-absence'],
      { queryParams: { returnToTrainingAndQuals: 'true' } },
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public downloadTrainingCertificate(trainingRecord: TrainingRecord): void {
    this.trainingService
      .downloadCertificates(
        this.workplace.uid,
        this.worker.uid,
        trainingRecord.uid,
        trainingRecord.trainingCertificates,
      )
      .subscribe(
        () => {
          this.certificateErrors = {};
        },
        (_error) => {
          const categoryName = trainingRecord.trainingCategory.category;
          this.certificateErrors = {
            [categoryName]: "There's a problem with this download. Try again later or contact us for help.",
          };
        },
      );
  }

  public uploadTrainingCertificate(event: CertificateUpload): void {
    const { files, trainingRecord } = event;

    const errors = CustomValidators.validateUploadCertificates(files);
    if (errors?.length > 0) {
      const categoryName = trainingRecord.trainingCategory.category;
      this.certificateErrors = { [categoryName]: errors[0] };
      return;
    }

    this.trainingService
      .addCertificateToTraining(this.workplace.uid, this.worker.uid, trainingRecord.uid, files)
      .subscribe(
        () => {
          this.certificateErrors = {};
          this.refreshTraining().then(() => {
            this.alertService.addAlert({
              type: 'success',
              message: 'Certificate uploaded',
            });
          });
        },
        (_error) => {
          const categoryName = trainingRecord.trainingCategory.category;
          this.certificateErrors = {
            [categoryName]: "There's a problem with this upload. Try again later or contact us for help.",
          };
        },
      );
  }

  private async refreshTraining() {
    const updatedData: TrainingAndQualificationRecords = await this.workerService
      .getAllTrainingAndQualificationRecords(this.workplace.uid, this.worker.uid)
      .toPromise();
    const updatedTrainingData = updatedData.training;
    this.setTraining(updatedTrainingData);
  }
}
