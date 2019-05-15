import { BulkUploadPageComponent } from './bulk-upload-page/bulk-upload-page.component';
import { BulkUploadRoutingModule } from '@features/bulk-upload/bulk-upload-routing.module';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { CheckWorkplaceReferencesComponent } from './check-workplace-references/check-workplace-references.component';
import { CommonModule } from '@angular/common';
import { DownloadDataFilesComponent } from './download-data-files/download-data-files.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { UploadDataFilesComponent } from './upload-data-files/upload-data-files.component';
import { SelectedFilesListComponent } from './selected-files-list/selected-files-list.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, BulkUploadRoutingModule],
  declarations: [
    BulkUploadPageComponent,
    CheckWorkplaceReferencesComponent,
    DownloadDataFilesComponent,
    FileUploadComponent,
    UploadDataFilesComponent,
    SelectedFilesListComponent,
  ],
  providers: [BulkUploadService]
})
export class BulkUploadModule {}
