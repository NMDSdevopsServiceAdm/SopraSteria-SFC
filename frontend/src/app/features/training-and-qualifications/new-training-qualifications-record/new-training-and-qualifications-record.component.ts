import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment, mandatoryTraining } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { TrainingRecord, TrainingRecordCategory, TrainingRecords } from '@core/model/training.model';
import {
  ActionsListData,
  CertificateDownloadEvent,
  CertificateUploadEvent,
  TrainingAndQualificationRecords,
} from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { QualificationCertificateService, TrainingCertificateService } from '@core/services/certificate.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PdfTrainingAndQualificationService } from '@core/services/pdf-training-and-qualification.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';
import { FileUtil } from '@core/utils/file-util';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { from, merge, Subscription } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { PdfMakeService } from '../../../core/services/pdf-make.service';

@Component({
  selector: 'app-new-training-and-qualifications-record',
  templateUrl: './new-training-and-qualifications-record.component.html',
  styleUrls: ['./new-training-and-qualification.component.scss'],
})
export class NewTrainingAndQualificationsRecordComponent implements OnInit, OnDestroy {
  @ViewChild('tabEl') tabEl;
  private subscriptions: Subscription = new Subscription();
  public actionsListData: ActionsListData = [];
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
  public missingMandatoryTraining: TrainingRecordCategory[] = [];
  public qualificationsByGroup: QualificationsByGroup;
  public lastUpdatedDate: Date;
  public fragmentsObject: Record<string, string> = {
    allRecords: 'all-records',
    mandatoryTraining: 'mandatory-training',
    nonMandatoryTraining: 'non-mandatory-training',
    qualifications: 'qualifications',
  };
  public certificateErrors: Record<string, string> = {}; // {categoryName: errorMessage}
  private trainingRecords: TrainingRecords;
  private downloadingAllCertsInBackground = false;
  public workerHasCertificate = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private trainingStatusService: TrainingStatusService,
    private trainingService: TrainingService,
    private trainingCertificateService: TrainingCertificateService,
    private qualificationCertificateService: QualificationCertificateService,
    private workerService: WorkerService,
    private alertService: AlertService,
    public viewContainerRef: ViewContainerRef,
    private pdfTrainingAndQualificationService: PdfTrainingAndQualificationService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private pdfMakeService: PdfMakeService,
  ) {
    pdfTrainingAndQualificationService.setViewContainer = viewContainerRef;
  }

  public ngOnInit(): void {
    this.setPageData();
    this.breadcrumbService.show(this.getBreadcrumbsJourney());
    this.setUpTabSubscription();
    this.updateTrainingExpiresSoonDate();
    this.setTraining();
    this.checkWorkerHasCertificateOrNot();
    this.setUpAlertSubscription();
    this.setReturnRoute();
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

  private setPageData(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    this.qualificationsByGroup = this.route.snapshot.data.trainingAndQualificationRecords.qualifications;
    this.trainingRecords = this.route.snapshot.data.trainingAndQualificationRecords.training;
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

  private setTraining(): void {
    this.setMandatoryTraining();
    this.setMissingMandatoryTraining(this.mandatoryTraining);
    this.setNonMandatoryTraining();

    this.clearActionsList();
    this.populateActionsList(this.mandatoryTraining, 'Mandatory');
    this.populateActionsList(this.missingMandatoryTraining, 'Mandatory');
    this.populateActionsList(this.nonMandatoryTraining, 'Non-mandatory');

    this.sortActionsList();

    this.getLastUpdatedDate([this.qualificationsByGroup?.lastUpdated, this.trainingRecords?.lastUpdated]);
  }

  private setMandatoryTraining() {
    this.mandatoryTraining = this.trainingRecords.mandatory;
    this.sortTrainingAlphabetically(this.mandatoryTraining);
    this.mandatoryTrainingCount = this.getTrainingCount(this.mandatoryTraining);
    this.getStatus(this.mandatoryTraining);
  }

  private setNonMandatoryTraining() {
    this.nonMandatoryTraining = this.sortTrainingAlphabetically(this.trainingRecords.nonMandatory);
    this.nonMandatoryTrainingCount = this.getTrainingCount(this.nonMandatoryTraining);
    this.getStatus(this.nonMandatoryTraining);
  }

  private setMissingMandatoryTraining(mandatoryTraining: TrainingRecordCategory[]): void {
    const trainingCategoryIds = this.getMandatoryTrainingIds(mandatoryTraining);
    const missingMandatoryTrainings = this.filterTrainingCategoriesWhereTrainingExists(trainingCategoryIds);
    this.missingMandatoryTraining = missingMandatoryTrainings.map((missingMandatoryTraining) => {
      return {
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
            trainingStatus: 2,
          },
        ],
      };
    });
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

  private clearActionsList(): void {
    this.actionsListData = [];
  }

  private populateActionsList(trainingCategories: TrainingRecordCategory[], typeOfTraining: string): void {
    trainingCategories.forEach((trainingCategory) => {
      trainingCategory.trainingRecords.forEach((trainingRecord: TrainingRecord) => {
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

  public actionsListNavigate(event: Event, actionListItem): void {
    event.preventDefault();
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

  public navigateToNewTab(event: Event, fragmentString: string): void {
    event.preventDefault();
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

  public navigateToLongTermAbsence(event: Event): void {
    event.preventDefault();
    this.router.navigate(
      ['/workplace', this.workplace.uid, 'training-and-qualifications-record', this.worker.uid, 'long-term-absence'],
      { queryParams: { returnToTrainingAndQuals: 'true' } },
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getCertificateService(event: CertificateDownloadEvent | CertificateUploadEvent) {
    switch (event.recordType) {
      case 'qualification':
        return this.qualificationCertificateService;
      case 'training':
        return this.trainingCertificateService;
    }
  }

  public downloadCertificate(event: CertificateDownloadEvent) {
    const certificateService = this.getCertificateService(event);
    const { recordUid, filesToDownload: files } = event;

    const subscription = certificateService
      .downloadCertificates(this.workplace.uid, this.worker.uid, recordUid, files)
      .subscribe(
        () => {
          this.certificateErrors = {};
        },
        (_error) => {
          const categoryName = event.recordType === 'training' ? event.categoryName : event.qualificationType;
          this.certificateErrors = {
            [categoryName]: "There's a problem with this download. Try again later or contact us for help.",
          };
        },
      );
    this.subscriptions.add(subscription);
  }

  public uploadCertificate(event: CertificateUploadEvent) {
    const { recordUid, files } = event;
    const categoryName = event.recordType === 'training' ? event.categoryName : event.qualificationType;

    const errors = CustomValidators.validateUploadCertificates(files);
    if (errors?.length > 0) {
      this.certificateErrors = { [categoryName]: errors[0] };
      return;
    }

    const certificateService = this.getCertificateService(event);

    const subscription = certificateService
      .addCertificates(this.workplace.uid, this.worker.uid, recordUid, files)
      .subscribe(
        () => {
          this.certificateErrors = {};
          this.refreshTrainingAndQualificationRecords().then(() => {
            this.alertService.addAlert({
              type: 'success',
              message: 'Certificate uploaded',
            });
          });
        },
        (_error) => {
          this.certificateErrors = {
            [categoryName]: "There's a problem with this upload. Try again later or contact us for help.",
          };
        },
      );
    this.subscriptions.add(subscription);
  }

  public downloadAllCertificates(event: Event) {
    event.preventDefault();

    if (this.downloadingAllCertsInBackground) {
      return;
    }

    this.downloadingAllCertsInBackground = true;

    const allTrainingCerts$ = this.trainingCertificateService.downloadAllCertificatesAsBlobs(
      this.workplace.uid,
      this.worker.uid,
    );
    const allQualificationCerts$ = this.qualificationCertificateService.downloadAllCertificatesAsBlobs(
      this.workplace.uid,
      this.worker.uid,
    );

    const zipFileName = this.worker.nameOrId
      ? `All certificates - ${this.worker.nameOrId}.zip`
      : 'All certificates.zip';

    const downloadAllCertificatesAsZip$ = merge(allTrainingCerts$, allQualificationCerts$).pipe(
      toArray(),
      mergeMap((allFileBlobs) => from(FileUtil.saveFilesAsZip(allFileBlobs, zipFileName))),
    );

    this.subscriptions.add(
      downloadAllCertificatesAsZip$.subscribe(
        () => {
          this.downloadingAllCertsInBackground = false;
        },
        (err) => {
          console.error('Error occurred when downloading all certificates: ', err);
          this.downloadingAllCertsInBackground = false;
        },
      ),
    );
  }

  private async refreshTrainingAndQualificationRecords() {
    const updatedData: TrainingAndQualificationRecords = await this.workerService
      .getAllTrainingAndQualificationRecords(this.workplace.uid, this.worker.uid)
      .toPromise();
    this.trainingRecords = updatedData.training;
    this.qualificationsByGroup = updatedData.qualifications;
    this.setTraining();
    this.checkWorkerHasCertificateOrNot();
  }

  private checkWorkerHasCertificateOrNot() {
    const allTrainingRecords = [...this.trainingRecords.mandatory, ...this.trainingRecords.nonMandatory];
    const hasTrainingCertificate = allTrainingRecords.some((record) =>
      record?.trainingRecords?.some((record) => record?.trainingCertificates?.length > 0),
    );
    const hasQualificationCertificate = this.qualificationsByGroup.groups.some((group) =>
      group?.records?.some((record) => record?.qualificationCertificates?.length > 0),
    );

    this.workerHasCertificate = hasTrainingCertificate || hasQualificationCertificate;
  }
}
