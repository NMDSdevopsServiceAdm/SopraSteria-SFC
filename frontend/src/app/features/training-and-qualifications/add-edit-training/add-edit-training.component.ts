import dayjs from 'dayjs';
import { merge } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, effect, OnInit, viewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { TrainingCertificate, TrainingRecord as LegacyIncorrectTrainingRecordType } from '@core/model/training.model';
import { CertificateDownload } from '@core/model/trainingAndQualifications.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCertificateService } from '@core/services/certificate.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingProviderService } from '@core/services/training-provider.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { DateUtil } from '@core/utils/date-util';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { AddEditTrainingDirective } from '@shared/directives/add-edit-training/add-edit-training.directive';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';

type TrainingRecord = LegacyIncorrectTrainingRecordType & {
  completed: string;
  expires: string;
  accredited?: YesNoDontKnow;
};

@Component({
  selector: 'app-add-edit-training',
  templateUrl: '../../../shared/directives/add-edit-training/add-edit-training.component.html',
  styleUrl: './add-edit-training.component.scss',
  standalone: false,
})
export class AddEditTrainingComponent extends AddEditTrainingDirective implements OnInit, AfterViewInit {
  public category: string;
  public establishmentUid: string;
  public workerId: string;
  private _filesToUpload: File[];
  public filesToRemove: TrainingCertificate[] = [];
  public certificateErrors: string[] | null;
  public isTrainingRecordMatchedToTrainingCourse: boolean;

  public completedDate = viewChild<DatePickerComponent>('completed');
  public expiryDate = viewChild<DatePickerComponent>('expires');

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected trainingCategoryService: TrainingCategoryService,
    protected certificateService: TrainingCertificateService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
    protected http: HttpClient,
    protected trainingProviderService: TrainingProviderService,
    protected changeDetectorRef: ChangeDetectorRef,
  ) {
    super(
      formBuilder,
      route,
      router,
      backLinkService,
      errorSummaryService,
      trainingService,
      trainingCategoryService,
      workerService,
      alertService,
      trainingProviderService,
    );

    effect(() => {
      if (this.completedDate() && this.expiryDate()) {
        this.setupCheckExpiryMismatch();
      }
    });
  }

  protected init(): void {
    this.trainingService.trainingOrQualificationPreviouslySelected = 'training';
    this.worker = this.workerService.worker;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    this.trainingCourses = this.route.snapshot.data?.trainingCourses ?? [];
    this.showCategory = true;

    if (this.trainingRecordId) {
      this.fillForm();
    } else if (this.trainingCategory) {
      this.category = this.trainingCategory.category;
      this.form.patchValue({
        category: this.trainingCategory.id,
      });
    }

    this.establishmentUid = this.route.snapshot.params?.establishmentuid;
    this.workerId = this.route.snapshot.params?.id;

    if (!this.trainingCategory && !this.trainingRecordId) {
      this.router.navigate([
        `workplace/${this.establishmentUid}/training-and-qualifications-record/${this.workerId}/add-training`,
      ]);
      return;
    }
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  public setTitle(): void {
    this.title = this.trainingRecordId ? 'Training record details' : 'Add training record details';
  }

  protected setSectionHeading(): void {
    this.section = this.worker.nameOrId;
  }

  protected setButtonText(): void {
    this.buttonText = this.trainingRecordId ? 'Save and return' : 'Save record';
  }

  private fillForm(): void {
    const trainingRecord = this.route.snapshot.data?.trainingRecord;
    if (!trainingRecord) {
      return;
    }
    this.trainingRecord = trainingRecord;
    this.category = trainingRecord.trainingCategory.category;
    this.trainingCategory = trainingRecord.trainingCategory;
    this.trainingCertificates = trainingRecord.trainingCertificates;
    this.isTrainingRecordMatchedToTrainingCourse = trainingRecord.isMatchedToTrainingCourse;

    const completed = this.trainingRecord.completed ? dayjs(this.trainingRecord.completed, DATE_PARSE_FORMAT) : null;
    const expires = this.trainingRecord.expires ? dayjs(this.trainingRecord.expires, DATE_PARSE_FORMAT) : null;
    this.form.patchValue({
      title: this.trainingRecord.title,
      accredited: this.trainingRecord.accredited,
      deliveredBy: this.trainingRecord.deliveredBy,
      externalProviderName: this.trainingRecord.externalProviderName,
      howWasItDelivered: this.trainingRecord.howWasItDelivered,
      validityPeriodInMonth: this.trainingRecord.validityPeriodInMonth,
      doesNotExpire: this.trainingRecord.doesNotExpire,

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
    if (this.trainingRecord?.notes?.length > 0) {
      this.notesOpen = true;
      this.remainingCharacterCount = this.notesMaxLength - this.trainingRecord.notes.length;
    }
    this.updateShowUpdateRecordsWithTrainingCourseDetails();
    this.checkExpiryMismatchOnInit(trainingRecord);
  }

  public removeSavedFile(fileIndexToRemove: number): void {
    let tempTrainingCertificates = this.trainingCertificates.filter(
      (certificate, index) => index !== fileIndexToRemove,
    );

    this.filesToRemove.push(this.trainingCertificates[fileIndexToRemove]);

    this.trainingCertificates = tempTrainingCertificates;
  }

  public handleValidityPeriodChange(newValue: string | number): void {
    super.handleValidityPeriodChange(newValue);
    this.checkExpiryMismatch();
  }

  private setupCheckExpiryMismatch(): void {
    merge(this.completedDate().onChange.asObservable(), this.expiryDate().onChange.asObservable()).subscribe(() => {
      this.checkExpiryMismatch();
    });
  }

  private checkExpiryMismatchOnInit(training: TrainingRecord): boolean {
    const completedDate = DateUtil.toDayjs(training.completed);
    const expiresDate = DateUtil.toDayjs(training.expires);
    const validityPeriodInMonth = training.validityPeriodInMonth;

    if (!completedDate || !expiresDate || !validityPeriodInMonth) {
      return;
    }

    const expectedExpiryDate = completedDate.add(validityPeriodInMonth, 'months');
    const dateNotMatching = !expiresDate.isSame(expectedExpiryDate, 'day');

    this.expiryMismatchWarning = dateNotMatching;
    this.changeDetectorRef.detectChanges();
  }

  private checkExpiryMismatch(): void {
    // to co-exist with {updateOn: 'submit'},
    // we read the native element values instead of Angular form values

    const completedDate = DateUtil.toDayjs(this.completedDate()?.internalState);
    const expiresDate = DateUtil.toDayjs(this.expiryDate()?.internalState);
    const validityPeriodInMonth = this.validityPeriodInMonth?.currentNumber;

    if (!completedDate || !expiresDate || !validityPeriodInMonth) {
      this.expiryMismatchWarning = false;
      return;
    }

    const expectedExpiryDate = completedDate.add(validityPeriodInMonth, 'months');
    const dateNotMatching = !expiresDate.isSame(expectedExpiryDate, 'day');

    this.expiryMismatchWarning = dateNotMatching;
  }

  protected submit(record: any): void {
    this.submitButtonDisabled = true;
    let submitTrainingRecord = this.trainingRecordId
      ? this.workerService.updateTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId, record)
      : this.workerService.createTrainingRecord(this.workplace.uid, this.worker.uid, record);

    if (this.filesToRemove?.length > 0) {
      this.deleteTrainingCertificate(this.filesToRemove);
    }

    if (this.filesToUpload?.length > 0) {
      submitTrainingRecord = submitTrainingRecord.pipe(mergeMap((response) => this.uploadNewCertificate(response)));
    }

    this.subscriptions.add(
      submitTrainingRecord.subscribe(
        () => this.onSuccess(),
        (error) => this.onError(error),
      ),
    );
  }

  get filesToUpload(): File[] {
    return this._filesToUpload ?? [];
  }

  private set filesToUpload(files: File[]) {
    this._filesToUpload = files ?? [];
  }

  private resetUploadFilesError(): void {
    this.certificateErrors = null;
  }

  public getUploadComponentAriaDescribedBy(): string {
    if (this.certificateErrors) {
      return 'uploadCertificate-errors uploadCertificate-aria-text';
    } else if (this.filesToUpload?.length > 0) {
      return 'uploadCertificate-aria-text';
    } else {
      return 'uploadCertificate-hint uploadCertificate-aria-text';
    }
  }

  public onSelectFiles(newFiles: File[]): void {
    this.resetUploadFilesError();
    const errors = CustomValidators.validateUploadCertificates(newFiles);

    if (errors) {
      this.certificateErrors = errors;
      return;
    }

    const combinedFiles = [...newFiles, ...this.filesToUpload];
    this.filesToUpload = combinedFiles;
  }

  public removeFileToUpload(fileIndexToRemove: number): void {
    const filesToKeep = this.filesToUpload.filter((_file, index) => index !== fileIndexToRemove);
    this.filesToUpload = filesToKeep;
    this.certificateErrors = [];
  }

  private uploadNewCertificate(trainingRecordResponse: any) {
    const trainingRecordId = this.trainingRecordId ?? trainingRecordResponse.uid;

    return this.certificateService.addCertificates(
      this.workplace.uid,
      this.worker.uid,
      trainingRecordId,
      this.filesToUpload,
    );
  }

  public downloadCertificates(fileIndex: number): void {
    const filesToDownload =
      fileIndex != null
        ? [this.formatForCertificateDownload(this.trainingCertificates[fileIndex])]
        : this.trainingCertificates.map((certificate) => {
            return this.formatForCertificateDownload(certificate);
          });
    this.subscriptions.add(
      this.certificateService
        .downloadCertificates(this.workplace.uid, this.worker.uid, this.trainingRecordId, filesToDownload)
        .subscribe(
          () => {
            this.certificateErrors = [];
          },
          (_error) => {
            this.certificateErrors = ["There's a problem with this download. Try again later or contact us for help."];
          },
        ),
    );
  }

  private formatForCertificateDownload(certificate: TrainingCertificate): CertificateDownload {
    return { uid: certificate.uid, filename: certificate.filename };
  }

  private deleteTrainingCertificate(files: TrainingCertificate[]) {
    this.subscriptions.add(
      this.certificateService
        .deleteCertificates(this.establishmentUid, this.workerId, this.trainingRecordId, files)
        .subscribe(() => {}),
    );
  }

  private onSuccess() {
    this.trainingService.clearSelectedTrainingCategory();
    this.trainingService.clearIsTrainingCourseSelected();
    const message = this.trainingRecordId ? 'Training record updated' : 'Training record added';

    this.router.navigate(this.previousUrl).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: message,
      });
    });
  }

  private onError(error) {
    console.log(error);
    this.submitButtonDisabled = false;
  }

  public onSelectATrainingCourse(): void {
    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'training',
      this.trainingRecordId,
      'include-training-course-details',
    ]);
  }

  public updateShowUpdateRecordsWithTrainingCourseDetails(): void {
    this.showUpdateRecordsWithTrainingCourseDetails =
      this.trainingRecordId && this.trainingCourses.length > 0 && !this.isTrainingRecordMatchedToTrainingCourse;
  }
}
