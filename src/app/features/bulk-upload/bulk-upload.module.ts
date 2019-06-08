import { BulkUploadPageComponent } from './bulk-upload-page/bulk-upload-page.component';
import { BulkUploadRoutingModule } from '@features/bulk-upload/bulk-upload-routing.module';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { CheckWorkplaceReferencesComponent } from './check-workplace-references/check-workplace-references.component';
import { CommonModule } from '@angular/common';
import { DownloadDataFilesComponent } from './download-data-files/download-data-files.component';
import { FilesUploadComponent } from './files-upload/files-upload.component';
import { FilesUploadProgressComponent } from './files-upload-progress/files-upload-progress.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectedFilesListComponent } from './selected-files-list/selected-files-list.component';
import { SharedModule } from '@shared/shared.module';
import { UploadDataFilesComponent } from './upload-data-files/upload-data-files.component';
import { UploadedFilesListComponent } from './uploaded-files-list/uploaded-files-list.component';
import { ValidateStatusComponent } from './validate-status/validate-status.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, BulkUploadRoutingModule],
  declarations: [
    BulkUploadPageComponent,
    CheckWorkplaceReferencesComponent,
    DownloadDataFilesComponent,
    FilesUploadComponent,
    FilesUploadProgressComponent,
    SelectedFilesListComponent,
    UploadDataFilesComponent,
    UploadedFilesListComponent,
    ValidateStatusComponent,
  ],
  providers: [BulkUploadService]
})
export class BulkUploadModule {}
