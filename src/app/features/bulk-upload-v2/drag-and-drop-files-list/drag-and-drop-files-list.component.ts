import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  BulkUploadFileType,
  FileValidateStatus,
  ValidatedFile,
  ValidatedFilesResponse,
} from '@core/model/bulk-upload.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { AlertService } from '@core/services/alert.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { DialogService } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UploadWarningDialogComponent } from '@features/bulk-upload/upload-warning-dialog/upload-warning-dialog.component';
import { filter, findIndex } from 'lodash';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-drag-and-drop-files-list',
  templateUrl: './drag-and-drop-files-list.component.html',
  styleUrls: ['./drag-and-drop-files-list.component.scss'],
  providers: [I18nPluralPipe],
})
export class DragAndDropFilesListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public bulkUploadFileTypeEnum = BulkUploadFileType;
  public preValidationError: boolean;
  public totalErrors = 0;
  public totalWarnings = 0;
  public uploadedFiles: ValidatedFile[] = [];
  public validationErrors: Array<ErrorDefinition> = [];
  public validationComplete = false;
  public pluralMap: { [key: string]: string } = {
    '=1': 'There was # error in the file',
    other: 'There were # errors in the file',
  };
  public preValidationErrorMessage = '';

  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private i18nPluralPipe: I18nPluralPipe,
    private router: Router,
    private alertService: AlertService,
    private dialogService: DialogService,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit() {
    this.getUploadedFiles();
    this.preValidateFilesSubscription();
  }

  private getUploadedFiles(): void {
    this.subscriptions.add(
      this.bulkUploadService.uploadedFiles$.subscribe((uploadedFiles: ValidatedFile[]) => {
        if (uploadedFiles) {
          this.uploadedFiles = uploadedFiles;
          this.totalErrors = this.uploadedFiles.map((f) => f.errors).reduce((p, c) => c + p);
        }
      }),
    );
    this.subscriptions.add(
      this.bulkUploadService.getBulkUploadStatus(this.establishmentService.primaryWorkplace.uid).subscribe((state) => {
        if (['PASSED', 'WARNINGS', 'FAILED'].includes(state)) {
          this.validationComplete = true;
        }
      }),
    );
  }

  private preValidateFilesSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.preValidateFiles$.subscribe((preValidateFiles: boolean) => {
        if (preValidateFiles) {
          this.validationComplete = false;
          this.preValidateFiles();
        }
      }),
    );
  }

  private preValidateFiles(): void {
    this.subscriptions.add(
      this.bulkUploadService
        .preValidateFiles(this.establishmentService.primaryWorkplace.uid)
        .pipe(take(1))
        .subscribe(
          (response: ValidatedFile[]) => {
            this.validationErrors = [];
            this.checkForMandatoryFiles(response);
            this.checkForInvalidFiles(response);
            this.uploadedFiles = response;
          },
          (response: HttpErrorResponse) => this.bulkUploadService.serverError$.next(response.error.message),
        ),
    );
  }

  private checkForMandatoryFiles(response: ValidatedFile[]): void {
    const files: string[] = response.map((data) => this.bulkUploadFileTypeEnum[data.fileType]);

    if (
      !files.includes(this.bulkUploadFileTypeEnum.Establishment) ||
      !files.includes(this.bulkUploadFileTypeEnum.Worker)
    ) {
      this.preValidationError = true;
    } else {
      this.preValidationError = false;
    }

    this.bulkUploadService.preValidationError$.next(this.preValidationError);
  }

  private checkForInvalidFiles(response: ValidatedFile[]) {
    response.forEach((file) => {
      if (!file.fileType || file.fileType === null) {
        file.errors = 1;
        this.validationErrors.push({
          name: this.getFileId(file),
          message: 'The file was not recognised',
        });
        this.preValidationError = true;
      }
    });
    this.bulkUploadService.validationErrors$.next(this.validationErrors);
  }

  public getErrorMessage(file: ValidatedFile) {
    const errorDefinition = this.validationErrors.find((validatedFile) => validatedFile.name === this.getFileId(file));
    return errorDefinition ? errorDefinition.message : this.i18nPluralPipe.transform(file.errors, this.pluralMap);
  }

  public getFileType(fileName: string): string {
    return this.bulkUploadService.getFileType(fileName);
  }

  public validateFiles(): void {
    this.totalErrors = 0;
    this.totalWarnings = 0;
    this.uploadedFiles.map((file: ValidatedFile) => (file.status = FileValidateStatus.Validating));

    this.subscriptions.add(
      this.bulkUploadService.validateFiles(this.establishmentService.primaryWorkplace.uid).subscribe(
        (response: ValidatedFilesResponse) => {
          this.onValidateComplete(response);
        },
        (response: HttpErrorResponse) => {
          if (response.status === 400) {
            this.onValidateComplete(response.error);
            return;
          }
          this.onValidateError(response);
        },
      ),
    );
  }

  public preValidateCheck(): void {
    const fileCount = this.uploadedFiles ? this.uploadedFiles.length : 0;

    if (fileCount < 2) {
      this.preValidationErrorMessage = 'You need to select 2 or 3 files.';
      return;
    }

    if (fileCount > 3) {
      this.preValidationErrorMessage = 'You can only upload 2 or 3 files.';
      return;
    }

    this.preValidationErrorMessage = '';
    this.validateFiles();
  }

  public beginCompleteUpload(): void {
    const establishmentsFile = this.uploadedFiles.find((file) => file.fileType === 'Establishment');
    const workersFile = this.uploadedFiles.find((file) => file.fileType === 'Worker');

    if ((establishmentsFile && establishmentsFile.deleted > 0) || (workersFile && workersFile.deleted > 0)) {
      const dialog = this.dialogService.open(UploadWarningDialogComponent, {
        establishmentsFile,
        workersFile,
      });

      dialog.afterClosed.subscribe((continueUpload) => {
        if (continueUpload) {
          this.completeUpload();
        }
      });
      return;
    }
    this.completeUpload();
  }

  public completeUpload() {
    this.bulkUploadService
      .complete(this.establishmentService.primaryWorkplace.uid)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          const hasProp = (obj, prop) => Object.prototype.hasOwnProperty.bind(obj)(prop);

          if (hasProp(response, 'message')) {
            this.bulkUploadService.serverError$.next(response.message);
          } else {
            this.router.navigate(['/dashboard']);
            this.alertService.addAlert({ type: 'success', message: 'The bulk upload is complete.' });
          }
        },
        (response) => {
          this.onValidateError(response);
        },
      );
  }

  public displayDownloadReportLink(file: ValidatedFile) {
    return file.errors > 0 || file.warnings > 0;
  }

  public getValidationError(file: ValidatedFile): ErrorDefinition {
    return {
      name: this.getFileId(file),
      message: this.i18nPluralPipe.transform(file.errors, this.pluralMap),
    };
  }

  public downloadFile(event: Event, key: string) {
    event.preventDefault();

    this.bulkUploadService
      .getUploadedFileSignedURL(this.establishmentService.primaryWorkplace.uid, key)
      .subscribe((signedURL) => {
        window.open(signedURL);
      });
  }

  public deleteFile(event, fileName: string): void {
    event.preventDefault();
    this.uploadedFiles = this.uploadedFiles.filter((file: ValidatedFile) => file.filename !== fileName);
    this.validationComplete = false;

    this.bulkUploadService.deleteFile(this.establishmentService.primaryWorkplace.uid, fileName).subscribe();
  }

  /**
   * Encode the filename so we have valid HTML
   * @param url string
   */
  public encodeUrl(url: string): string {
    return encodeURI(url);
  }

  /**
   * Set validate success update uploaded files
   * And then set total warnings and/or errors and status
   * @param response
   */
  private onValidateComplete(response: ValidatedFilesResponse): void {
    // this.uploadedFiles = [response.establishment, response.training, response.workers];
    this.validationErrors = [];

    /* TODO: BE returns a different object for ValidatedFiles than UploadedFiles
     *       previously we were just overwritting the uploaded files object with the
     *       returned data, but that would then wipe out other information needed to
     *       to display the uploaded files list. This now joins the objects together
     *       but it would be a lot better if the API sent the same object back.
     */
    filter(response, 'filename').forEach((validatedFile: ValidatedFile) => {
      const index = findIndex(this.uploadedFiles, ['fileType', validatedFile.fileType]);
      this.uploadedFiles[index] = { ...this.uploadedFiles[index], ...validatedFile };
      this.uploadedFiles[index].status = this.uploadedFiles[index].errors
        ? FileValidateStatus.Fail
        : FileValidateStatus.Pass;
      this.totalWarnings = this.totalWarnings + this.uploadedFiles[index].warnings;
      this.totalErrors = this.totalErrors + this.uploadedFiles[index].errors;
      if (this.uploadedFiles[index].errors) {
        this.validationErrors.push(this.getValidationError(this.uploadedFiles[index]));
      }
    });
    this.bulkUploadService.validationErrors$.next(this.validationErrors);
    this.validationComplete = true;
  }

  /**
   * Strip off file extension
   * Replace white spaces with '-'
   * Then convert to lowercase
   * @param file ValidatedFile
   */
  public getFileId(file: ValidatedFile): string {
    const fileName: string = file.filename.substr(0, file.filename.lastIndexOf('.'));
    const transformedFileName: string = fileName.replace(/\s/g, '-').toLowerCase();
    return `bulk-upload-validation-${transformedFileName}`;
  }

  /**
   * TODO in another ticket
   * @param error
   */
  private onValidateError(response: HttpErrorResponse): void {
    const error: ValidatedFilesResponse = response.error;
    //handle 503 with custom message to prevent service unavailable redirection
    if (response.status === 503) {
      const customeMessage = [
        {
          name: response.status,
          message: `Bulk upload is unable to continue processing your data due to an issue with your files.
          Please check and try again or contact Support on 0113 2410969.`,
        },
      ];
      this.bulkUploadService.serverError$.next(
        this.errorSummaryService.getServerErrorMessage(response.status, customeMessage),
      );
    } else {
      console.log(error);
    }
  }

  get hasWarnings() {
    return this.totalWarnings > 0;
  }

  get hasErrors() {
    return this.totalErrors > 0;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
