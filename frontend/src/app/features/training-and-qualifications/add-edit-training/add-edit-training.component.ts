import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { CertificateDownload, TrainingCertificate } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import dayjs from 'dayjs';
import { mergeMap } from 'rxjs/operators';

import { AddEditTrainingDirective } from '../../../shared/directives/add-edit-training/add-edit-training.directive';

@Component({
  selector: 'app-add-edit-training',
  templateUrl: '../../../shared/directives/add-edit-training/add-edit-training.component.html',
})
export class AddEditTrainingComponent extends AddEditTrainingDirective implements OnInit, AfterViewInit {
  public category: string;
  public establishmentUid: string;
  public workerId: string;
  private _filesToUpload: File[];
  public certificateErrors: string[] | null;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected trainingCategoryService: TrainingCategoryService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
    protected http: HttpClient,
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
    );
  }

  protected init(): void {
    this.trainingService.trainingOrQualificationPreviouslySelected = 'training';
    this.worker = this.workerService.worker;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
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
    this.subscriptions.add(
      this.workerService.getTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId).subscribe(
        (trainingRecord) => {
          if (trainingRecord) {
            this.trainingRecord = trainingRecord;
            this.category = trainingRecord.trainingCategory.category;
            this.trainingCategory = trainingRecord.trainingCategory;
            this.trainingCertificates = trainingRecord.trainingCertificates;

            const completed = this.trainingRecord.completed
              ? dayjs(this.trainingRecord.completed, DATE_PARSE_FORMAT)
              : null;
            const expires = this.trainingRecord.expires ? dayjs(this.trainingRecord.expires, DATE_PARSE_FORMAT) : null;
            this.form.patchValue({
              title: this.trainingRecord.title,
              accredited: this.trainingRecord.accredited,
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
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  protected submit(record: any): void {
    this.submitButtonDisabled = true;
    let submitTrainingRecord = this.trainingRecordId
      ? this.workerService.updateTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId, record)
      : this.workerService.createTrainingRecord(this.workplace.uid, this.worker.uid, record);

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
  }

  private uploadNewCertificate(trainingRecordResponse: any) {
    const trainingRecordId = this.trainingRecordId ?? trainingRecordResponse.uid;

    return this.trainingService.addCertificateToTraining(
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

    this.trainingService
      .downloadCertificates(this.workplace.uid, this.worker.uid, this.trainingRecordId, filesToDownload)
      .subscribe((res) => {
        if (!res.files || res.files.length == 0) {
          this.certificateErrors = ["There's a problem with this download. Try again later or contact us for help."];
          return;
        }
        this.trainingService.triggerCertificateDownloads(res.files);
      });
  }

  private formatForCertificateDownload(certificate: TrainingCertificate): CertificateDownload {
    return { uid: certificate.uid, filename: certificate.filename };
  }

  private onSuccess() {
    this.trainingService.clearSelectedTrainingCategory();
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
}
