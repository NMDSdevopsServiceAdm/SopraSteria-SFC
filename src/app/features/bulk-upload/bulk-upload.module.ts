import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '@core/services/dialog.service';
import { BulkUploadRoutingModule } from '@features/bulk-upload/bulk-upload-routing.module';
import {
  CompleteUploadWarningDialogComponent,
} from '@features/bulk-upload/complete-upload-warning-dialog/complete-upload-warning-dialog';
import { SharedModule } from '@shared/shared.module';

import { BulkUploadPageComponent } from './bulk-upload-page/bulk-upload-page.component';
import { CheckWorkplaceReferencesComponent } from './check-workplace-references/check-workplace-references.component';
import { DownloadDataFilesComponent } from './download-data-files/download-data-files.component';
import { FileValidateStatusComponent } from './file-validate-status/file-validate-status.component';
import { FilesUploadProgressComponent } from './files-upload-progress/files-upload-progress.component';
import { FilesUploadComponent } from './files-upload/files-upload.component';
import { PostValidationActionsComponent } from '@features/bulk-upload/post-validation-actions/post-validation-actions.component';
import { SelectedFilesListComponent } from './selected-files-list/selected-files-list.component';
import { UploadDataFilesComponent } from './upload-data-files/upload-data-files.component';
import { UploadedFilesListComponent } from './uploaded-files-list/uploaded-files-list.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, BulkUploadRoutingModule, OverlayModule],
  declarations: [
    BulkUploadPageComponent,
    CheckWorkplaceReferencesComponent,
    DownloadDataFilesComponent,
    FilesUploadComponent,
    FilesUploadProgressComponent,
    FileValidateStatusComponent,
    SelectedFilesListComponent,
    UploadDataFilesComponent,
    UploadedFilesListComponent,
    CompleteUploadWarningDialogComponent,
    PostValidationActionsComponent,
  ],
  providers: [DialogService],
  entryComponents: [CompleteUploadWarningDialogComponent],
})
export class BulkUploadModule {}
