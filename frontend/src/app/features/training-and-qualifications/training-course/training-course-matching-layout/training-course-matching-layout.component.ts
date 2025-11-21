import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCertificate, TrainingRecordRequest } from '@core/model/training.model';
import { CertificateDownload } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCertificateService } from '@core/services/certificate.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { DateValidator } from '@shared/validators/date.validator';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-training-course-matching-layout',
  templateUrl: './training-course-matching-layout.component.html',
})
export class TrainingCourseMatchingLayoutComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public worker: Worker;
  public establishmentUid: string;
  public workerId: string;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public submitButtonDisabled: boolean = false;
  public buttonText: string;
  public notesOpen = false;
  public notesMaxLength = 1000;
  public remainingCharacterCount: number = this.notesMaxLength;
  public subscriptions: Subscription = new Subscription();
  public notesValue = '';
  public trainingRecord: any;
  public trainingRecordId: string;
  public expiryMismatchWarning: any;
  public certificateErrors: string[] | null;
  private _filesToUpload: File[];
  public trainingCertificates: TrainingCertificate[] = [];
  public filesToRemove: TrainingCertificate[] = [];
  public trainingCategory: { id: number; category: string };

  public record: any;

  constructor(
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    protected formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    protected backLinkService: BackLinkService,
    public trainingService: TrainingService,
    private alertService: AlertService,
    private certificateService: TrainingCertificateService,
  ) {}

  ngOnInit(): void {
    this.trainingRecord = this.route.snapshot.data.trainingRecord;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    this.worker = this.workerService.worker;
    this.establishmentUid = this.route.snapshot.params?.establishmentuid;
    this.workerId = this.route.snapshot.params?.id;
    this.workplace = this.establishmentService.establishment;
    this.setupForm();
    this.fillForm();
    this.autoFillExpiry();
    this.checkExpiryMismatch();

    this.form.valueChanges.subscribe(() => {
      this.autoFillExpiry();
      this.checkExpiryMismatch();
    });

    this.setBackLink();
    this.setupFormErrorsMap();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      completed: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      expires: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      notes: [null, Validators.maxLength(this.notesMaxLength)],
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

  private toDayjs(input: string | { day: number; month: number; year: number } | null): dayjs.Dayjs | null {
    if (!input) return null;

    // Case 1: DB string "2025-01-20"
    if (typeof input === 'string') {
      return dayjs(input, DATE_PARSE_FORMAT);
    }

    // Case 2: Form group object { day, month, year }
    const { day, month, year } = input;
    if (!day || !month || !year) return null;

    return dayjs(`${year}-${month}-${day}`, DATE_PARSE_FORMAT);
  }

  private toFormDate(date: dayjs.Dayjs | null): { day: number; month: number; year: number } | null {
    return date
      ? {
          day: date.date(),
          month: date.month() + 1,
          year: date.year(),
        }
      : null;
  }

  private dateGroupToDayjs(group: UntypedFormGroup): dayjs.Dayjs | null {
    return this.toDayjs(group.value);
  }

  private fillForm(): void {
    const { completed, expires, notes, trainingCertificates } = this.trainingRecord;

    this.trainingCertificates = trainingCertificates;

    this.form.patchValue({
      completed: this.toFormDate(this.toDayjs(completed)),
      expires: this.toFormDate(this.toDayjs(expires)),
      notes,
    });
    if (this.trainingRecord?.notes?.length > 0) {
      this.notesOpen = true;
      this.remainingCharacterCount = this.notesMaxLength - this.trainingRecord.notes.length;
    }
  }

  private autoFillExpiry(): void {
    const completed = this.toDayjs(this.form.get('completed')?.value);
    const expires = this.toDayjs(this.form.get('expires')?.value);
    const validity = this.trainingRecord?.validityPeriodInMonth;

    if (completed && !expires && validity) {
      const newExpiry = completed.add(validity, 'month');

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
  private checkExpiryMismatch(): void {
    const { completed, expires } = this.form.value;
    const validityPeriodInMonth = this.trainingRecord?.validityPeriodInMonth;

    if (!completed?.day || !expires?.day || !validityPeriodInMonth) {
      this.expiryMismatchWarning = false;
      return;
    }
    const completedDate = this.toDayjs(completed);
    const expiresDate = this.toDayjs(expires);
    const expectedExpiry = completedDate?.add(validityPeriodInMonth, 'month');

    if (completedDate && expiresDate && expectedExpiry && this.form.valid) {
      const diff = !expiresDate.isSame(expectedExpiry, 'day');
      this.expiryMismatchWarning = diff;
    } else {
      this.expiryMismatchWarning = false;
    }
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
  private buildUpdatedRecord(): TrainingRecordRequest {
    const { completed, expires, notes } = this.form.controls;

    const completedDate = this.dateGroupToDayjs(completed as UntypedFormGroup);
    const expiresDate = this.dateGroupToDayjs(expires as UntypedFormGroup);

    return {
      ...this.trainingRecord,
      trainingCategory: { id: this.trainingRecord.trainingCategory.id },
      completed: completedDate ? completedDate.format(DATE_PARSE_FORMAT) : null,
      expires: expiresDate ? expiresDate.format(DATE_PARSE_FORMAT) : null,
      notes: notes.value ?? null,
    };
  }

  public onSubmit(): void {
    this.submitted = true;

    if (!this.form.valid) {
      if (this.form.controls.notes?.errors?.maxlength) {
        this.notesOpen = true;
      }
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    const record = this.buildUpdatedRecord();

    if (!this.trainingRecordId) {
      return;
    }

    let submitTrainingRecord = this.workerService.updateTrainingRecord(
      this.workplace.uid,
      this.worker.uid,
      this.trainingRecordId,
      record,
    );

    if (this.filesToRemove?.length > 0) {
      this.deleteTrainingCertificate(this.filesToRemove);
    }

    if (this.filesToUpload?.length > 0) {
      submitTrainingRecord = submitTrainingRecord.pipe(mergeMap((response) => this.uploadNewCertificate(response)));
    }

    this.subscriptions.add(submitTrainingRecord.subscribe(() => this.onSubmitSuccess()));
  }

  private onSubmitSuccess(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Training record updated',
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
      this.workplace.uid,
      this.worker.uid,
      trainingRecordId,
      this.filesToUpload,
    );
  }

  public removeSavedFile(fileIndexToRemove: number): void {
    let tempTrainingCertificates = this.trainingCertificates.filter(
      (certificate, index) => index !== fileIndexToRemove,
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
  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  protected navigateToDeleteTrainingRecord(): void {
    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'training',
      this.trainingRecordId,
      'delete',
    ]);
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }
  public handleOnInput(event: Event) {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }
  public toggleNotesOpen(): void {
    this.notesOpen = !this.notesOpen;
  }
}
