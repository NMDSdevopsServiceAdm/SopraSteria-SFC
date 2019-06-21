import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FileValidateStatus, UploadedFile, ValidatedFile, ValidatedFilesResponse } from '@core/model/bulk-upload.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { saveAs } from 'file-saver';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-uploaded-files-list',
  templateUrl: './uploaded-files-list.component.html',
  providers: [I18nPluralPipe],
})
export class UploadedFilesListComponent implements OnInit, OnDestroy {
  public uploadedFiles: UploadedFile[];
  public validationComplete = false;
  public totalWarnings = 0;
  public totalErrors = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private i18nPluralPipe: I18nPluralPipe,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupSubscription();
  }

  public setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.selectedFiles$
        .pipe(map((selectedFiles: File[]) => selectedFiles.map((file: File) => ({ name: file.name }))))
        .subscribe((uploadedFiles: UploadedFile[]) => (this.uploadedFiles = uploadedFiles))
    );
  }

  public getFileType(fileName: string): string {
    return this.bulkUploadService.getFileType(fileName);
  }

  public validateFiles(): void {
    this.uploadedFiles.map((file: UploadedFile) => (file.status = FileValidateStatus.Validating));

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
          const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
          saveAs(blob, 'Bulk Upload Validation Report.txt');
        },
        () => {}
      );
  }

  /**
   * Set validate success flag, set file type labels
   * And then set record count and status
   * Then update ui
   * @param response
   */
  private onValidateComplete(response: ValidatedFilesResponse): void {
    response.establishment.fileType = 'Workplace';
    response.training.fileType = 'Training';
    response.workers.fileType = 'Staff';

    const validatedFiles: Array<ValidatedFile> = [response.establishment, response.training, response.workers];
    const validationErrors: Array<ErrorDefinition> = [];

    this.uploadedFiles.forEach((file: UploadedFile) => {
      const validatedFile: ValidatedFile = filter(validatedFiles, ['filename', file.name])[0];
      file.records = validatedFile.records;
      file.fileType = validatedFile.fileType;
      file.warnings = validatedFile.warnings;
      file.errors = validatedFile.errors;
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

  private getValidationError(file: UploadedFile): ErrorDefinition {
    return {
      name: this.getFileId(file),
      message: this.i18nPluralPipe.transform(file.errors, {
        '=1': 'There was # error in the file',
        other: 'There were # errors in the file',
      }),
    };
  }

  private getFileId(file: UploadedFile) {
    return `bulk-upload-validation-${file.name.substr(0, file.name.lastIndexOf('.'))}`;
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
    this.bulkUploadService
      .complete(this.establishmentService.establishmentId)
      .pipe(take(1))
      .subscribe(() => {
        this.bulkUploadService.uploadComplete$.next(true);
        this.router.navigate(['/dashboard']);
      });
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
