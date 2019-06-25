import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ValidatedFile } from '@core/model/bulk-upload.model';
import { AlertService } from '@core/services/alert.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  CompleteUploadWarningDialogComponent,
} from '@features/bulk-upload/complete-upload-warning-dialog/complete-upload-warning-dialog';
import { saveAs } from 'file-saver';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-post-validation-actions',
  templateUrl: './post-validation-actions.component.html',
})
export class PostValidationActionsComponent {
  @Input() uploadedFiles: Array<ValidatedFile>;
  @Input() hasErrors: boolean;
  @Input() hasWarnings: boolean;

  constructor(
    private establishmentService: EstablishmentService,
    private bulkUploadService: BulkUploadService,
    private router: Router,
    private alertService: AlertService,
    private dialogService: DialogService
  ) {}

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

  public beginCompleteUpload(): void {
    this.bulkUploadService.serverError$.next(null);

    let deletedWorkplaces = 0;
    let deletedStaffRecords = 0;

    this.uploadedFiles.forEach(file => {
      if (file.fileType === 'Establishment') {
        deletedWorkplaces = file.deleted;
      }
      if (file.fileType === 'Worker') {
        deletedStaffRecords = file.deleted;
      }
    });
    if (deletedWorkplaces > 0 || deletedStaffRecords > 0) {
      const dialog = this.dialogService.open(CompleteUploadWarningDialogComponent, {
        deletedWorkplaces,
        deletedStaffRecords,
      });
      dialog.afterClosed.subscribe(continueUpload => {
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
      .complete(this.establishmentService.establishmentId)
      .pipe(take(1))
      .subscribe(
        () => {
          this.alertService.addAlert({ type: 'success', message: 'Bulk upload complete.' });
          this.router.navigate(['/dashboard']);
        },
        response => {
          this.bulkUploadService.serverError$.next(response.error.message);
        }
      );
  }
}
