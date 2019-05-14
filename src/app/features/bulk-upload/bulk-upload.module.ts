import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkUploadPageComponent } from './bulk-upload-page/bulk-upload-page.component';
import { BulkUploadRoutingModule } from '@features/bulk-upload/bulk-upload-routing.module';
import { SharedModule } from '@shared/shared.module';
import { CheckWorkplaceReferencesComponent } from './check-workplace-references/check-workplace-references.component';
import { DownloadDataFilesComponent } from './download-data-files/download-data-files.component';
import { UploadDataFilesComponent } from './upload-data-files/upload-data-files.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BulkUploadRoutingModule
  ],
  declarations: [BulkUploadPageComponent, CheckWorkplaceReferencesComponent, DownloadDataFilesComponent, UploadDataFilesComponent]
})
export class BulkUploadModule {}
