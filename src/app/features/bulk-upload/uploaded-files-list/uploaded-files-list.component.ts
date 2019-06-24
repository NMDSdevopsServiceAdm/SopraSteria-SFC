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
import { AlertsService } from '@core/services/alerts.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { saveAs } from 'file-saver';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-uploaded-files-list',
  templateUrl: './uploaded-files-list.component.html',
  providers: [I18nPluralPipe],
})
export class UploadedFilesListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public bulkUploadFileTypeEnum = BulkUploadFileType;
  public preValidationError: boolean;
  public totalErrors = 0;
  public totalWarnings = 0;
  public uploadedFiles: ValidatedFile[];
  public validationComplete = false;

  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private i18nPluralPipe: I18nPluralPipe,
    private router: Router,
    private alertsService: AlertsService
  ) {}

  ngOnInit() {
    this.checkForUploadedFiles();
    this.checkForSelectedFiles();
  }

  private checkForUploadedFiles(): void {
    this.subscriptions.add(
      this.bulkUploadService.uploadedFiles$.subscribe((uploadedFiles: ValidatedFile[]) => {
        if (uploadedFiles) {
          this.preValidateFiles();
        }
      })
    );
  }

  private checkForSelectedFiles(): void {
    this.subscriptions.add(
      this.bulkUploadService.selectedFiles$.subscribe((selectedFiles: File[]) => {
        if (selectedFiles) {
          this.preValidateFiles();
        }
      })
    );
  }

  private preValidateFiles(): void {
    this.subscriptions.add(
      this.bulkUploadService
        .preValidateFiles(this.establishmentService.establishmentId)
        .subscribe(
          (response: ValidatedFile[]) => this.checkForMandatoryFiles(response),
          (response: HttpErrorResponse) => this.bulkUploadService.serverError$.next(response.error.message)
        )
    );
  }

  private checkForMandatoryFiles(response: ValidatedFile[]): void {
    const files: string[] = response.map(data => this.bulkUploadFileTypeEnum[data.fileType]);
    this.uploadedFiles = response;

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

  public getFileType(fileName: string): string {
    return this.bulkUploadService.getFileType(fileName);
  }

  public validateFiles(): void {
    this.uploadedFiles.map((file: ValidatedFile) => (file.status = FileValidateStatus.Validating));

    this.subscriptions.add(
      this.bulkUploadService.validateFiles(this.establishmentService.establishmentId).subscribe(
        (response: ValidatedFilesResponse) => {
          this.onValidateComplete(response);
        },
        (response: HttpErrorResponse) => {
          if (response.status === 400) {
            this.onValidateComplete(response.error);
            return;
          }
          this.onValidateError(response);
        }
      )
    );
  }

  public downloadReport(): void {
    this.bulkUploadService
      .getReport(this.establishmentService.establishmentId)
      .pipe(take(1))
      .subscribe(
        response => {
          const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const filenameMatches = response.headers.get('content-disposition').match(filenameRegEx);
          const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
          const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
          saveAs(blob, filename);
        },
        () => {}
      );
  }

  /**
   * Set validate success update uploaded files
   * And then set total warnings and/or errors and status
   * @param response
   */
  private onValidateComplete(response: ValidatedFilesResponse): void {
    this.uploadedFiles = [response.establishment, response.training, response.workers];
    this.uploadedFiles = filter(this.uploadedFiles, 'filename');
    const validationErrors: Array<ErrorDefinition> = [];

    this.uploadedFiles.forEach((file: ValidatedFile) => {
      file.status = file.errors ? FileValidateStatus.Fail : FileValidateStatus.Pass;
      this.totalWarnings = this.totalWarnings + file.warnings;
      this.totalErrors = this.totalErrors + file.errors;
      if (file.errors) {
        validationErrors.push(this.getValidationError(file));
      }
    });
    this.bulkUploadService.validationErrors$.next(validationErrors);
    this.validationComplete = true;
  }

  private getValidationError(file: ValidatedFile): ErrorDefinition {
    return {
      name: this.getFileId(file),
      message: this.i18nPluralPipe.transform(file.errors, {
        '=1': 'There was # error in the file',
        other: 'There were # errors in the file',
      }),
    };
  }

  private getFileId(file: ValidatedFile): string {
    return `bulk-upload-validation-${file.filename.substr(0, file.filename.lastIndexOf('.'))}`;
  }

  /**
   * TODO in another ticket
   * @param error
   */
  private onValidateError(response: HttpErrorResponse): void {
    const error: ValidatedFilesResponse = response.error;
    console.log(error);
  }

  public completeUpload(): void {
    this.bulkUploadService.serverError$.next(null);
    this.bulkUploadService
      .complete(this.establishmentService.establishmentId)
      .pipe(take(1))
      .subscribe(
        () => {
          this.alertsService.addAlert({ type: 'success', message: 'Bulk upload complete.' });
          this.router.navigate(['/dashboard']);
        },
        response => {
          this.bulkUploadService.serverError$.next(response.error.message);
        }
      );
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
