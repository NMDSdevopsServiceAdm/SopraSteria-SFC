import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
import { FileUtil } from '@core/utils/file-util';
import { UploadWarningDialogComponent } from '@features/bulk-upload/upload-warning-dialog/upload-warning-dialog.component';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import { combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-drag-and-drop-files-list',
  templateUrl: './drag-and-drop-files-list.component.html',
  styleUrls: ['./drag-and-drop-files-list.component.scss'],
  providers: [I18nPluralPipe],
})
export class DragAndDropFilesListComponent implements OnInit, OnDestroy {
  @Input() public sanitise: boolean;
  private subscriptions: Subscription = new Subscription();
  public bulkUploadFileTypeEnum = BulkUploadFileType;
  public preValidationError: boolean;
  public fileErrors: Array<string> = [];
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
  public showPreValidateErrorMessage = false;
  public disableButton = false;

  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private i18nPluralPipe: I18nPluralPipe,
    private router: Router,
    private alertService: AlertService,
    private dialogService: DialogService,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.getUploadedFiles();
    this.preValidateFilesSubscription();
    this.subscriptions.add(
      this.bulkUploadService.selectedFiles$.subscribe(() => {
        this.disableButton = true;
      }),
    );
    this.disableButton = false;
  }

  public showFileRecords(file): string {
    if (file.fileType === null) {
      return '-';
    }
    return file.records === null ? '0' : file.records;
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
    this.bulkUploadService.showNonCsvErrorMessage(false);

    if (fileCount == 0) {
      this.preValidationErrorMessage = 'You need to select 2 or 3 files.';
      return;
    }

    if (fileCount > 3) {
      this.preValidationErrorMessage = 'You can only upload 2 or 3 files.';
      return;
    }

    if (this.checkForInvalidFiles()) {
      return;
    }

    if (this.checkForDuplicateTypes()) {
      this.preValidationErrorMessage = 'You can only upload 1 of each file type.';
      return;
    }

    if (this.checkFileType()) {
      return;
    }

    this.preValidationErrorMessage = '';

    this.validateFiles();
  }

  public getFileErrors(file: ValidatedFile): string {
    return this.fileErrors[file.key];
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

  public getValidationError(file: ValidatedFile): ErrorDefinition {
    return {
      name: this.getFileId(file),
      message: this.i18nPluralPipe.transform(file.errors, this.pluralMap),
    };
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

  public downloadFile(event: Event, key: string): void {
    event.preventDefault();

    // this.bulkUploadService
    //   .getUploadedFileSignedURL(this.establishmentService.primaryWorkplace.uid, key)
    //   .subscribe((signedURL) => {
    //     window.open(signedURL);
    //   });

    let type: BulkUploadFileType = null;

    if (key.includes('staff')) {
      type = this.sanitise ? BulkUploadFileType.WorkerSanitise : BulkUploadFileType.Worker;
    } else if (key.includes('workplace')) {
      type = BulkUploadFileType.Establishment;
    } else if (key.includes('training')) {
      type = BulkUploadFileType.Training;
    }

    this.bulkUploadService
      .getUploadedFileFromS3(this.establishmentService.primaryWorkplace.uid, key, type)
      .pipe(take(1))
      .subscribe((response) => {
        const filename = FileUtil.getFileName(response);
        const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, filename);
      });
  }

  public deleteFile(event: Event, fileName: string): void {
    event.preventDefault();
    this.uploadedFiles = this.uploadedFiles.filter((file: ValidatedFile) => file.filename !== fileName);
    this.validationComplete = false;
    this.preValidationErrorMessage = '';

    this.bulkUploadService.deleteFile(this.establishmentService.primaryWorkplace.uid, fileName).subscribe();
  }

  /**
   * Encode the filename so we have valid HTML
   * @param url string
   */
  public encodeUrl(url: string): string {
    return encodeURI(url);
  }

  private getUploadedFiles(): void {
    const files$ = this.bulkUploadService.uploadedFiles$;
    const state$ = this.bulkUploadService.getBulkUploadStatus(this.establishmentService.primaryWorkplace.uid);

    this.subscriptions.add(
      combineLatest([files$, state$]).subscribe(([uploadedFiles, state]) => {
        if (!uploadedFiles) {
          return;
        }

        this.uploadedFiles = uploadedFiles;
        this.totalErrors = this.uploadedFiles.map((f) => f.errors).reduce((p, c) => c + p);

        if (['PASSED', 'WARNINGS', 'FAILED'].includes(state)) {
          this.validationComplete = true;
        }
      }),
    );
  }

  private preValidateFilesSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.preValidateFiles$.subscribe((preValidateFiles: boolean) => {
        this.preValidationErrorMessage = '';
        this.fileErrors = [];
        this.showPreValidateErrorMessage = false;
        if (preValidateFiles) {
          this.validationComplete = false;
          this.preValidateFiles();
        } else {
          this.disableButton = false;
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
            this.uploadedFiles = response;
            this.disableButton = false;
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

  private checkForInvalidFiles(): boolean {
    const invalidFiles = this.uploadedFiles.filter(function (item) {
      return item.fileType === null;
    });

    invalidFiles.map((item: ValidatedFile) => {
      this.fileErrors[item.key] = "This file was not recognised.  Use the guidance to check it's set up correctly.";
    });

    return invalidFiles.length > 0;
  }

  private checkForDuplicateTypes(): boolean {
    const fileTypesArr = this.uploadedFiles.map(function (file) {
      return file.fileType;
    });
    return fileTypesArr.some(function (item, idx) {
      return fileTypesArr.indexOf(item) != idx;
    });
  }

  private checkFileType(): boolean {
    const fileTypes = [];
    this.uploadedFiles.forEach((file) => {
      fileTypes.push(file.fileType);
    });

    if (!fileTypes.includes('Worker') && !fileTypes.includes('Establishment')) {
      this.preValidationErrorMessage = 'You need to select your workplace and staff files.';
      return true;
    }

    if (!fileTypes.includes('Worker')) {
      this.preValidationErrorMessage = 'You need to select your staff file.';
      return true;
    }

    if (!fileTypes.includes('Establishment')) {
      this.preValidationErrorMessage = 'You need to select your workplace file.';
      return true;
    }
    return false;
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
   * TODO in another ticket
   * @param error
   */
  private onValidateError(response: HttpErrorResponse): void {
    const error: ValidatedFilesResponse = response.error;
    //handle 500 with custom message to prevent service unavailable redirection
    if (response.status === 500) {
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
