import dayjs from 'dayjs';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { mergeMap } from 'rxjs/operators';

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { INT_PATTERN } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import {
  Qualification,
  QualificationCertificate,
  QualificationRequest,
  QualificationResponse,
  QualificationType,
} from '@core/model/qualification.model';
import { Certificate, CertificateDownload } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { QualificationCertificateService } from '@core/services/certificate.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { QualificationService } from '@core/services/qualification.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Component({
    selector: 'app-add-edit-qualification',
    templateUrl: './add-edit-qualification.component.html',
    styleUrls: ['./add-edit-qualification.component.scss'],
    standalone: false
})
export class AddEditQualificationComponent implements OnInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public qualificationTypes: QualificationType[] = [];
  public qualificationId: string;
  public buttonText: string;
  public record: QualificationResponse;
  public worker: Worker;
  public workplace: Establishment;
  public yearValidators: ValidatorFn[];
  public notesMaxLength = 500;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();
  public previousUrl: Array<string>;
  public notesValue = '';
  public remainingCharacterCount: number;
  public intPattern = INT_PATTERN.toString();
  public notesOpen = false;
  public selectedQualification: Qualification;
  public qualificationType: string;
  public qualificationTitle: string;
  public qualificationCertificates: QualificationCertificate[] = [];
  private _filesToUpload: File[];
  public filesToRemove: QualificationCertificate[] = [];
  public certificateErrors: string[] | null;
  public submitButtonDisabled: boolean = false;

  constructor(
    private trainingService: TrainingService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private qualificationService: QualificationService,
    private certificateService: QualificationCertificateService,
  ) {
    this.yearValidators = [Validators.max(dayjs().year()), Validators.min(dayjs().subtract(100, 'years').year())];
  }

  ngOnInit(): void {
    this.previousUrl = [localStorage.getItem('previousUrl')];
    this.trainingService.trainingOrQualificationPreviouslySelected = 'qualification';

    this.form = this.formBuilder.group({
      year: [null, this.yearValidators],
      notes: [null, Validators.maxLength(this.notesMaxLength)],
    });

    this.worker = this.workerService.worker;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.qualificationId = this.route.snapshot.params.qualificationId;

    this.buttonText = this.qualificationId ? 'Save and return' : 'Save record';
    this.remainingCharacterCount = this.notesMaxLength;
    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);

    if (this.qualificationId) {
      this.subscriptions.add(
        this.workerService.getQualification(this.workplace.uid, this.worker.uid, this.qualificationId).subscribe(
          (record) => {
            if (record) {
              this.record = record;
              this.qualificationType = this.convertQualificationType(record.qualification.group);
              this.qualificationTitle = record.qualification.title;

              this.form.patchValue({
                year: this.record.year,
                notes: this.record.notes,
              });

              if (this.record.notes?.length > 0) {
                this.notesOpen = true;
                this.remainingCharacterCount = this.notesMaxLength - this.record.notes.length;
              }

              if (this.record.qualificationCertificates) {
                this.qualificationCertificates = this.record.qualificationCertificates;
              }
            }
          },
          (error) => {
            console.error(error.error);
          },
        ),
      );
    } else if (this.qualificationService.selectedQualification) {
      this.selectedQualification = this.qualificationService.selectedQualification;
      this.qualificationType = this.convertQualificationType(this.selectedQualification.group);
      this.qualificationTitle = this.selectedQualification.title;
    } else {
      this.router.navigate([
        `/workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}/add-qualification`,
      ]);
    }

    this.setupFormErrorsMap();
    this.setBackLink();
  }

  protected navigateToPreviousPage(): void {
    this.qualificationService.clearSelectedQualification();
    this.router.navigate(this.previousUrl);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'year',
        type: [
          {
            name: 'min',
            message: 'Year achieved must be this year or no more than 100 years ago',
          },
          {
            name: 'max',
            message: 'Year achieved must be this year or no more than 100 years ago',
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

  public handleOnInput(event: Event): void {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    this.addErrorLinkFunctionality();

    if (!this.form.valid) {
      if (this.form.controls.notes?.errors?.maxlength) {
        this.notesOpen = true;
      }
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    this.submitButtonDisabled = true;
    this.qualificationService.clearSelectedQualification();

    const { year, notes } = this.form.value;

    const record: QualificationRequest = {
      type: (this.record ? this.record.qualification.group : this.selectedQualification.group) as QualificationType,
      qualification: {
        id: this.record ? this.record.qualification.id : this.selectedQualification.id,
      },
      year,
      notes,
    };

    let submitQualificationRecord: Observable<any> = this.qualificationId
      ? this.workerService.updateQualification(this.workplace.uid, this.worker.uid, this.qualificationId, record)
      : this.workerService.createQualification(this.workplace.uid, this.worker.uid, record);

    if (this.filesToUpload?.length > 0) {
      submitQualificationRecord = submitQualificationRecord.pipe(
        mergeMap((response) => this.uploadNewCertificate(response)),
      );
    }

    if (this.filesToRemove?.length > 0) {
      this.deleteQualificationCertificate(this.filesToRemove);
    }

    this.subscriptions.add(
      submitQualificationRecord.subscribe(
        () => this.onSuccess(),
        (error) => this.onError(error),
      ),
    );
  }

  private uploadNewCertificate(response: QualificationResponse): Observable<any> {
    const qualifcationId = this.qualificationId ? this.qualificationId : response.uid;
    return this.certificateService.addCertificates(
      this.workplace.uid,
      this.worker.uid,
      qualifcationId,
      this.filesToUpload,
    );
  }

  public downloadCertificates(fileIndex: number | null): void {
    const filesToDownload = this.getFilesToDownload(fileIndex);

    this.subscriptions.add(
      this.certificateService
        .downloadCertificates(this.workplace.uid, this.worker.uid, this.qualificationId, filesToDownload)
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

  private getFilesToDownload(fileIndex: number | null): CertificateDownload[] {
    if (fileIndex !== null) {
      return [this.formatForCertificateDownload(this.qualificationCertificates[fileIndex])];
    }
    return this.qualificationCertificates.map(this.formatForCertificateDownload);
  }

  private formatForCertificateDownload(certificate: Certificate): CertificateDownload {
    return { uid: certificate.uid, filename: certificate.filename };
  }

  private onSuccess(): void {
    this.router
      .navigate([`/workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}/training`])
      .then(() => {
        if (this.qualificationId) {
          this.workerService.alert = { type: 'success', message: 'Qualification record saved' };
        } else {
          this.workerService.alert = { type: 'success', message: 'Qualification record added' };
        }
      });
  }

  private convertQualificationType(qualificationType: string): string {
    if (qualificationType === qualificationType.toUpperCase()) {
      return qualificationType;
    }

    return qualificationType.charAt(0).toLowerCase() + qualificationType.slice(1);
  }

  private onError(error): void {
    this.submitButtonDisabled = false;
    console.log(error);
  }

  public toggleNotesOpen(): void {
    this.notesOpen = !this.notesOpen;
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

  public removeSavedFile(fileIndexToRemove: number): void {
    this.filesToRemove.push(this.qualificationCertificates[fileIndexToRemove]);
    this.qualificationCertificates = this.qualificationCertificates.filter(
      (_certificate, index) => index !== fileIndexToRemove,
    );
  }

  private deleteQualificationCertificate(files: QualificationCertificate[]) {
    this.subscriptions.add(
      this.certificateService
        .deleteCertificates(this.workplace.uid, this.worker.uid, this.qualificationId, files)
        .subscribe(),
    );
  }

  protected navigateToDeleteQualificationRecord(): void {
    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'qualification',
      this.qualificationId,
      'delete',
    ]);
  }

  private addErrorLinkFunctionality(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
