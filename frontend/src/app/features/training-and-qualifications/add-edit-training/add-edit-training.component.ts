import { merge, Subscription } from 'rxjs';
import { filter, mergeMap, take } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, effect, OnInit, viewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TrainingCertificate, TrainingRecord as LegacyIncorrectTrainingRecordType } from '@core/model/training.model';
import { CertificateDownload } from '@core/model/trainingAndQualifications.model';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
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
  public expiresDate = viewChild<DatePickerComponent>('expires');
  private dateInputEventsListener$: Subscription;

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
      const completedDateInputBoxesExist = this.completedDate();
      const expiresDateInputboxesExist = this.expiresDate();

      if (completedDateInputBoxesExist && expiresDateInputboxesExist) {
        this.setupCheckExpiryMismatch();
      } else {
        this.clearEventListenerForDateInputs();
      }
    });
  }

  protected init(): void {
    this.trainingService.trainingOrQualificationPreviouslySelected = 'training';
    this.worker = this.workerService.worker;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    this.trainingCourses = this.route.snapshot.data?.trainingCourses ?? [];
    this.showCategory = true;
    this.establishmentUid = this.route.snapshot.params?.establishmentuid;
    this.workerId = this.route.snapshot.params?.id;

    const isEditingTraining = !!this.trainingRecordId;

    if (isEditingTraining) {
      this.fillForm();
    } else if (this.trainingCategory) {
      this.category = this.trainingCategory.category;
      this.form.patchValue({
        category: this.trainingCategory.id,
      });
    } else {
      this.router.navigate([
        `workplace/${this.establishmentUid}/training-and-qualifications-record/${this.workerId}/add-training-without-course`,
      ]);
      return;
    }
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
    const trainingRecord: TrainingRecord = this.route.snapshot.data?.trainingRecord;
    if (!trainingRecord) {
      return;
    }
    this.trainingRecord = trainingRecord;
    this.category = trainingRecord.trainingCategory.category;
    this.trainingCategory = trainingRecord.trainingCategory;
    this.trainingCertificates = trainingRecord.trainingCertificates;
    this.isTrainingRecordMatchedToTrainingCourse = trainingRecord.isMatchedToTrainingCourse;

    const gotExpiresDate = !!this.trainingRecord.expires;
    if (gotExpiresDate && this.trainingRecord.doesNotExpire) {
      this.trainingRecord.doesNotExpire = null;
    }

    const formValueToPatch = {
      title: this.trainingRecord.title,
      accredited: this.trainingRecord.accredited,
      deliveredBy: this.trainingRecord.deliveredBy,
      externalProviderName: this.trainingRecord.externalProviderName,
      howWasItDelivered: this.trainingRecord.howWasItDelivered,
      validityPeriodInMonth: this.trainingRecord.validityPeriodInMonth,
      doesNotExpire: this.trainingRecord.doesNotExpire,
      completed: DateUtil.toFormDate(this.trainingRecord.completed),
      expires: DateUtil.toFormDate(this.trainingRecord.expires),
      notes: this.trainingRecord.notes,
    };

    this.form.patchValue(formValueToPatch);

    if (this.trainingRecord?.notes?.length > 0) {
      this.notesOpen = true;
      this.remainingCharacterCount = this.notesMaxLength - this.trainingRecord.notes.length;
    }

    this.showExpiryDateInput = !this.trainingRecord.doesNotExpire;
    this.checkIfCanUpdateWithTrainingCourse();
    this.checkExpiryMismatchOnInit(trainingRecord);
  }

  public removeSavedFile(fileIndexToRemove: number): void {
    const tempTrainingCertificates = this.trainingCertificates.filter(
      (_certificate, index) => index !== fileIndexToRemove,
    );

    this.filesToRemove.push(this.trainingCertificates[fileIndexToRemove]);

    this.trainingCertificates = tempTrainingCertificates;
  }

  protected setupFormChangeListeners(): void {
    super.setupFormChangeListeners();
    this.setupExpiryDateDisplayLogic();
    this.setupExpiryDateAutofill();
  }

  private setupExpiryDateDisplayLogic(): void {
    const isAddingNewTraining = !this.trainingRecordId;
    if (isAddingNewTraining) {
      return;
    }

    const doesNotExpireCheckbox = this.form.get('doesNotExpire');

    const updateExpiryDateOnCheckboxChange = doesNotExpireCheckbox.valueChanges.subscribe((doesNotExpire) => {
      if (doesNotExpire) {
        this.showExpiryDateInput = false;
        this.clearExpiryDate();
      } else {
        this.showExpiryDateInput = true;
      }
    });

    this.subscriptions.add(updateExpiryDateOnCheckboxChange);
  }

  private clearExpiryDate(): void {
    this.form.patchValue({ expires: { day: null, month: null, year: null } });
  }

  private setupExpiryDateAutofill(): void {
    const isAddingNewTraining = !this.trainingRecordId;
    if (isAddingNewTraining) {
      return;
    }

    this.completedDate().onChange.subscribe(() => {
      this.autoFillExpiry();
    });
  }

  public autoFillExpiry(): void {
    if (!this.showExpiryDateInput || !this.expiresDate()) {
      return;
    }
    const completedDate = DateUtil.toDayjs(this.completedDate().internalState);
    const validity = this.validityPeriodInMonth.currentNumber;

    const expiryDateIsEmpty = Object.values(this.expiresDate().internalState).every((input) => input === null);

    if (completedDate && validity && expiryDateIsEmpty) {
      const newExpiryDate = DateUtil.expectedExpiryDate(completedDate, validity);

      this.form.patchValue({
        expires: {
          day: newExpiryDate.date(),
          month: newExpiryDate.month() + 1,
          year: newExpiryDate.year(),
        },
      });
    }
  }

  private clearEventListenerForDateInputs(): void {
    const oldSubscription = this.dateInputEventsListener$;
    if (oldSubscription) {
      oldSubscription.unsubscribe();
    }
  }

  private setupCheckExpiryMismatch(): void {
    const completedDateOrExpiresDateChanged = merge(
      this.completedDate().onChange.asObservable(),
      this.expiresDate().onChange.asObservable(),
      this.form.get('validityPeriodInMonth').valueChanges,
      this.form.get('doesNotExpire').valueChanges,
    );

    this.dateInputEventsListener$ = completedDateOrExpiresDateChanged.subscribe(() => {
      this.checkExpiryMismatch();
    });

    this.subscriptions.add(this.dateInputEventsListener$);
  }

  private checkExpiryMismatchOnInit(training: AddEditTrainingComponent['trainingRecord']): void {
    const completedDate = DateUtil.toDayjs(training.completed);
    const expiresDate = DateUtil.toDayjs(training.expires);
    const validityPeriodInMonth = training.validityPeriodInMonth;

    const expiryDateDoesNotMatch = DateUtil.expiryDateDoesNotMatch(completedDate, expiresDate, validityPeriodInMonth);

    if (expiryDateDoesNotMatch) {
      this.expiryMismatchWarning = true;
      this.changeDetectorRef.detectChanges();
    }
  }

  private checkExpiryMismatch(): void {
    // In order to co-exist with {updateOn: 'submit'},
    // here we read the values from the native html elements instead of Angular FormGroup
    const completedDate = DateUtil.toDayjs(this.completedDate()?.internalState);
    const expiresDate = DateUtil.toDayjs(this.expiresDate()?.internalState);
    const validityPeriodInMonth = this.validityPeriodInMonth?.currentNumber;

    this.expiryMismatchWarning = DateUtil.expiryDateDoesNotMatch(completedDate, expiresDate, validityPeriodInMonth);
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

  public checkIfCanUpdateWithTrainingCourse(): void {
    this.showUpdateRecordsWithTrainingCourseDetails =
      this.trainingRecordId && this.trainingCourses.length > 0 && !this.isTrainingRecordMatchedToTrainingCourse;
  }

  protected resetTrainingRecordsStateWhenClickedAway(): void {
    const parentPath = 'add-training-without-course';

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => !event.urlAfterRedirects?.includes(parentPath)),
        take(1),
      )
      .subscribe(() => {
        this.trainingService.resetState();
      });
  }
}
