import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileValidateStatus, UploadFile, ValidatedFile, ValidatedFilesResponse } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { saveAs } from 'file-saver';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-uploaded-files-list',
  templateUrl: './uploaded-files-list.component.html',
})
export class UploadedFilesListComponent implements OnInit, OnDestroy {
  public uploadedFiles: Array<UploadFile>;
  public validatedFiles: Array<UploadFile>;
  public validationComplete = false;
  public totalWarnings = 0;
  public totalErrors = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(private bulkUploadService: BulkUploadService, private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.setupSubscription();
  }

  public setupSubscription(): void {
    this.subscriptions.add(
      this.bulkUploadService.uploadedFiles$.subscribe((uploadedFiles: Array<UploadFile>) => {
        if (uploadedFiles) {
          this.uploadedFiles = uploadedFiles;
        }
      })
    );
  }

  public validateFiles(): void {
    this.uploadedFiles.map((file: UploadFile) => (file.status = FileValidateStatus.Validating));

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

    this.uploadedFiles.forEach((file: UploadFile) => {
      const validatedFile: ValidatedFile = filter(validatedFiles, ['filename', file.name])[0];
      file.records = validatedFile.records;
      file.fileType = validatedFile.fileType;
      file.warnings = validatedFile.warnings;
      file.errors = validatedFile.errors;
      file.status = file.errors ? FileValidateStatus.Fail : FileValidateStatus.Pass;
      this.totalWarnings = this.totalWarnings + file.warnings;
      this.totalErrors = this.totalErrors + file.errors;
      this.bulkUploadService.totalErrors$.next(this.totalErrors);
    });

    this.validationComplete = true;
  }

  /**
   * TODO in another ticket
   * @param error
   */
  private onValidateError(response: HttpErrorResponse): void {
    const error: ValidatedFilesResponse = response.error;
    console.log(error);
  }

  // TODO in another ticket
  public importFiles(): void {
    console.log('importFiles');
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
