import dayjs from 'dayjs';
import lodash from 'lodash';
import { Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { TrainingCourse } from '@core/model/training-course.model';
import {
  TrainingCertificate,
  TrainingRecord as LegacyIncorrectTrainingRecordType,
  TrainingRecordRequest,
  DeliveredBy,
} from '@core/model/training.model';
import { CertificateDownload } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCertificateService } from '@core/services/certificate.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { DateValidator } from '@shared/validators/date.validator';
import { showCorrectTrainingValidity } from '@shared/pipes/show-training-validity.pipe';
import { DateUtil } from '@core/utils/date-util';

type JourneyType = 'ApplyCourseToExistingRecord' | 'AddNewTrainingRecordWithCourse' | 'ViewExistingRecord';
type TrainingRecord = LegacyIncorrectTrainingRecordType & { completed: string; expires: string; accredited?: string };

@Component({
  selector: 'app-training-course-matching-layout',
  templateUrl: './training-course-matching-layout.component.html',
  standalone: false,
})
export class TrainingCourseMatchingLayoutComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public establishmentUid: string;
  public worker: Worker;
  public workerUid: string;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public notesMaxLength = 1000;
  public subscriptions: Subscription = new Subscription();
  public trainingRecord: TrainingRecord;
  public trainingRecordId: string;
  public summaryRowItems: { key: string; value: string }[];
  public certificateErrors: string[] | null;
  private _filesToUpload: File[];
  public trainingCertificates: TrainingCertificate[] = [];
  public filesToRemove: TrainingCertificate[] = [];
  public selectedTrainingCourse: TrainingCourse;
  public trainingCourses: TrainingCourse[];
  public journeyType: JourneyType;
  public headingText: string;
  public trainingToDisplay:
    | TrainingCourse
    | (TrainingRecord & { name: string; trainingCategoryName: string; trainingCategoryId: number });

  public expiryMismatchWarning: boolean;
  public showExpiryDateInput: boolean = false;
  public doesNotExpireWasTicked: boolean;
  public showWarningOnDoesNotExpireWithDate: boolean;

  constructor(
    private workerService: WorkerService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private errorSummaryService: ErrorSummaryService,
    private backLinkService: BackLinkService,
    private trainingService: TrainingService,
    private alertService: AlertService,
    private certificateService: TrainingCertificateService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.trainingRecord = this.route.snapshot.data?.trainingRecord;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    this.establishmentUid = this.route.snapshot.params?.establishmentuid;
    this.worker = this.workerService.worker;
    this.workerUid = this.route.snapshot.params?.id;

    this.loadTrainingCourse();
    this.determineJourneyType();
    this.setupForm();
    this.loadTrainingToDisplay();
    this.checkWhetherShouldShowExpiryDateInput();
    this.buildSummaryRowItems();
    this.loadDataAccordingToJourneyType();

    this.setBackLink();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private determineJourneyType(): void {
    const isExistingRecord = this.trainingRecordId && this.trainingRecord;
    if (!isExistingRecord) {
      this.journeyType = 'AddNewTrainingRecordWithCourse';
      return;
    }

    if (this.selectedTrainingCourse) {
      this.journeyType = 'ApplyCourseToExistingRecord';
      return;
    }

    const isMatchedToTrainingCourse = this.trainingRecord.isMatchedToTrainingCourse;
    if (isMatchedToTrainingCourse) {
      this.journeyType = 'ViewExistingRecord';
      return;
    }

    // if not matching any of the expected journey
    this.returnToWorkerTrainingRecordPage();
  }

  private loadTrainingCourse(): void {
    this.trainingCourses = this.route.snapshot.data?.trainingCourses;
    this.selectedTrainingCourse = this.trainingService.getSelectedTrainingCourse();
  }

  private loadDataAccordingToJourneyType(): void {
    switch (this.journeyType) {
      case 'ApplyCourseToExistingRecord': {
        this.fillForm();
        this.autoFillExpiry();
        this.setupChecksForSoftWarnings();
        this.headingText = 'Training record details';
        break;
      }
      case 'ViewExistingRecord': {
        this.fillForm();
        this.setupChecksForSoftWarnings();
        this.headingText = 'Training record details';
        break;
      }
      case 'AddNewTrainingRecordWithCourse': {
        this.headingText = 'Add training record details';
      }
    }
  }

  private checkWhetherShouldShowExpiryDateInput() {
    switch (this.journeyType) {
      case 'ApplyCourseToExistingRecord':
      case 'ViewExistingRecord': {
        const recordHasExpiryDate = !!this.trainingRecord?.expires;
        this.doesNotExpireWasTicked =
          this.journeyType === 'ApplyCourseToExistingRecord'
            ? this.selectedTrainingCourse.doesNotExpire
            : this.trainingRecord.doesNotExpire;

        const allowInputExpiryDate = !this.doesNotExpireWasTicked;
        this.showExpiryDateInput = recordHasExpiryDate || allowInputExpiryDate;
        break;
      }
      case 'AddNewTrainingRecordWithCourse': {
        this.doesNotExpireWasTicked = false;
        this.showExpiryDateInput = false;
        break;
      }
    }
  }

  private loadTrainingToDisplay(): void {
    switch (this.journeyType) {
      case 'ApplyCourseToExistingRecord':
      case 'AddNewTrainingRecordWithCourse': {
        this.trainingToDisplay = this.selectedTrainingCourse;
        break;
      }
      case 'ViewExistingRecord': {
        const trainingToDisplay = {
          ...this.trainingRecord,
          name: this.trainingRecord.title,
          trainingCategoryName: this.trainingRecord.trainingCategory.category,
          trainingCategoryId: this.trainingRecord.trainingCategory.id,
        };

        this.trainingToDisplay = trainingToDisplay;
        break;
      }
    }
  }

  private buildSummaryRowItems(): void {
    const training = this.trainingToDisplay;

    const providerNameRow =
      training?.deliveredBy === DeliveredBy.ExternalProvider
        ? [{ key: 'Training provider name', value: training.externalProviderName ?? '-' }]
        : [];

    this.summaryRowItems = [
      { key: 'Training course name', value: training?.name ?? '-' },
      { key: 'Training category', value: training?.trainingCategoryName },
      { key: 'Is the training course accredited?', value: training?.accredited ?? '-' },
      { key: 'Who delivered the training course?', value: training?.deliveredBy ?? '-' },
      ...providerNameRow,
      {
        key: 'How was the training course delivered?',
        value: training?.howWasItDelivered ?? '-',
      },
      {
        key: 'How long is the training valid for?',
        value: showCorrectTrainingValidity(training),
      },
    ];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      completed: this.formBuilder.group(
        {
          day: null,
          month: null,
          year: null,
        },
        { updateOn: this.journeyType === 'AddNewTrainingRecordWithCourse' ? 'submit' : 'change' },
      ),
      expires: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      notes: [null, { validators: [Validators.maxLength(this.notesMaxLength)], updateOn: 'submit' }],
    });

    const minDate = dayjs().subtract(100, 'years');

    this.form
      .get('completed')
      .setValidators([DateValidator.dateValid(), DateValidator.todayOrBefore(), DateValidator.min(minDate)]);
    this.form
      .get('expires')
      .setValidators([
        DateValidator.dateValid(),
        DateValidator.min(minDate),
        DateValidator.beforeStartDate('completed', true, true),
      ]);
  }

  private fillForm(): void {
    const { completed, expires, notes, trainingCertificates } = this.trainingRecord;

    this.trainingCertificates = trainingCertificates;

    this.form.patchValue({
      completed: DateUtil.toFormDate(completed),
      expires: DateUtil.toFormDate(expires),
      notes,
    });
  }

  private setupChecksForSoftWarnings(): void {
    this.checkExpiryMismatch();
    this.setupCheckExpiryMismatch();

    if (this.doesNotExpireWasTicked) {
      this.setupShouldNotHaveExpiryDateSoftwarning();
    }
  }

  private setupCheckExpiryMismatch(): void {
    this.form.valueChanges.subscribe(() => {
      this.checkExpiryMismatch();
    });

    this.form.get('completed').statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.autoFillExpiry();
      }
    });
  }

  private checkExpiryMismatch(): void {
    const { completed, expires } = this.form.value;
    const validityPeriodInMonth = this.trainingToDisplay?.validityPeriodInMonth;

    const completedDate = DateUtil.toDayjs(completed);
    const expiresDate = DateUtil.toDayjs(expires);
    const expiryDateDoesNotMatch = DateUtil.expiryDateDoesNotMatch(completedDate, expiresDate, validityPeriodInMonth);

    this.expiryMismatchWarning = expiryDateDoesNotMatch;
  }

  private setupShouldNotHaveExpiryDateSoftwarning(): void {
    this.showWarningOnDoesNotExpireWithDate = !this.expiryDateIsEmpty;

    this.form.get('expires').valueChanges.subscribe((dateInputs) => {
      const expireDateIsFilled = Object.values(dateInputs).every((x) => x);

      this.showWarningOnDoesNotExpireWithDate = expireDateIsFilled;
    });
  }

  get expiryDateIsEmpty(): boolean {
    return Object.values(this.form.get('expires').value).every((input) => input == null);
  }

  public autoFillExpiry(): void {
    const completed = DateUtil.toDayjs(this.form.get('completed')?.value);
    const validity = this.trainingToDisplay?.validityPeriodInMonth;

    const expiryDateIsEmpty = Object.values(this.form.get('expires').value).every((input) => input == null);

    if (completed && validity && expiryDateIsEmpty) {
      const newExpiry = DateUtil.expectedExpiryDate(completed, validity);

      this.form.patchValue(
        {
          expires: {
            day: newExpiry.date(),
            month: newExpiry.month() + 1,
            year: newExpiry.year(),
          },
        },
        { emitEvent: false },
      );
    }
  }

  private getExpectedExpiryDate(): dayjs.Dayjs {
    const { completed } = this.form.value;
    const completedDate = DateUtil.toDayjs(completed);
    const validityPeriodInMonth = this.trainingToDisplay?.validityPeriodInMonth;

    return DateUtil.expectedExpiryDate(completedDate, validityPeriodInMonth);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'completed',
        type: [
          {
            name: 'dateValid',
            message: 'Date completed must be a valid date',
          },
          {
            name: 'todayOrBefore',
            message: 'Date completed must be before today',
          },
          {
            name: 'dateMin',
            message: 'Date completed cannot be more than 100 years ago',
          },
        ],
      },
      {
        item: 'expires',
        type: [
          {
            name: 'dateValid',
            message: 'Expiry date must be a valid date',
          },
          {
            name: 'dateMin',
            message: 'Expiry date cannot be more than 100 years ago',
          },
          {
            name: 'beforeStartDate',
            message: 'Expiry date must be after date completed',
          },
        ],
      },
      {
        item: 'notes',
        type: [
          {
            name: 'maxlength',
            message: `Notes must be ${this.notesMaxLength} characters or fewer`,
          },
        ],
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private buildRequestBody(): TrainingRecordRequest {
    const { completed, expires, notes } = this.form.controls;

    const completedDate = DateUtil.toDayjs(completed?.value);
    const expiresDate =
      this.journeyType === 'AddNewTrainingRecordWithCourse'
        ? this.getExpectedExpiryDate()
        : DateUtil.toDayjs(expires?.value);

    if (this.journeyType === 'ViewExistingRecord') {
      return {
        ...this.trainingRecord,
        completed: completedDate ? completedDate.format(DATE_PARSE_FORMAT) : null,
        expires: expiresDate ? expiresDate.format(DATE_PARSE_FORMAT) : null,
        notes: notes.value ?? null,
      };
    }

    const fieldsToCopyFromCourse = [
      'accredited',
      'deliveredBy',
      'trainingProviderId',
      'otherTrainingProviderName',
      'howWasItDelivered',
      'doesNotExpire',
      'validityPeriodInMonth',
    ];
    const dataFromTrainingCourse = lodash.pick(this.selectedTrainingCourse, fieldsToCopyFromCourse);

    return {
      ...dataFromTrainingCourse,
      title: this.trainingToDisplay.name,
      trainingCategory: { id: this.trainingToDisplay.trainingCategoryId },
      trainingCourseFK: this.selectedTrainingCourse.id,
      completed: completedDate ? completedDate.format(DATE_PARSE_FORMAT) : null,
      expires: expiresDate ? expiresDate.format(DATE_PARSE_FORMAT) : null,
      notes: notes.value ?? null,
    };
  }

  public onSubmit(): void {
    this.submitted = true;
    this.triggerValidatorForExpiresDate();

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const trainingRecord = this.buildRequestBody();

    let submitTrainingRecord;

    if (this.trainingRecordId) {
      submitTrainingRecord = this.workerService.updateTrainingRecord(
        this.establishmentUid,
        this.workerUid,
        this.trainingRecordId,
        trainingRecord,
      );
    } else {
      submitTrainingRecord = this.workerService.createTrainingRecord(
        this.establishmentUid,
        this.workerUid,
        trainingRecord,
      );
    }

    if (this.filesToRemove?.length > 0) {
      this.deleteTrainingCertificate(this.filesToRemove);
    }

    if (this.filesToUpload?.length > 0) {
      submitTrainingRecord = submitTrainingRecord.pipe(mergeMap((response) => this.uploadNewCertificate(response)));
    }

    this.subscriptions.add(submitTrainingRecord.subscribe(() => this.onSubmitSuccess()));
  }

  private triggerValidatorForExpiresDate(): void {
    this.form.get('expires').markAsTouched();
    this.form.get('expires').markAsDirty();
    this.form.get('expires').updateValueAndValidity();
  }

  private onSubmitSuccess(): void {
    const alertMessage =
      this.journeyType === 'AddNewTrainingRecordWithCourse' ? 'Training record added' : 'Training record updated';

    this.returnToWorkerTrainingRecordPage().then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: alertMessage,
      });
    });
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
      this.establishmentUid,
      this.workerUid,
      trainingRecordId,
      this.filesToUpload,
    );
  }

  public removeSavedFile(fileIndexToRemove: number): void {
    const tempTrainingCertificates = this.trainingCertificates.filter(
      (_certificate, index) => index !== fileIndexToRemove,
    );

    this.filesToRemove.push(this.trainingCertificates[fileIndexToRemove]);

    this.trainingCertificates = tempTrainingCertificates;
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
        .downloadCertificates(this.establishmentUid, this.workerUid, this.trainingRecordId, filesToDownload)
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
        .deleteCertificates(this.establishmentUid, this.workerUid, this.trainingRecordId, files)
        .subscribe(() => {}),
    );
  }
  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public navigateToDeleteTrainingRecord(): void {
    this.router.navigate([
      '/workplace',
      this.establishmentUid,
      'training-and-qualifications-record',
      this.workerUid,
      'training',
      this.trainingRecordId,
      'delete',
    ]);
  }

  public returnToSelectTrainingCoursePage(event: Event): void {
    event.preventDefault();

    switch (this.journeyType) {
      case 'ApplyCourseToExistingRecord': {
        this.router.navigate(['../include-training-course-details'], { relativeTo: this.route });
        return;
      }
      case 'ViewExistingRecord': {
        this.router.navigate(['../include-training-course-details'], { relativeTo: this.route });
        return;
      }
      case 'AddNewTrainingRecordWithCourse': {
        this.location.back();
        return;
      }
    }
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.returnToWorkerTrainingRecordPage();
  }

  private returnToWorkerTrainingRecordPage(): Promise<boolean> {
    const url = ['/workplace', this.establishmentUid, 'training-and-qualifications-record', this.workerUid, 'training'];
    return this.router.navigate(url);
  }
}
