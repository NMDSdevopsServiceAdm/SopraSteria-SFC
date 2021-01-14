import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StaffReferencesResolver } from '@core/resolvers/staff-references.resolver';
import { WorkplacesReferencesResolver } from '@core/resolvers/workplace-references.resolver';
import { DialogService } from '@core/services/dialog.service';
import { BulkUploadV2RoutingModule } from '@features/bulk-upload-v2/bulk-upload-routing.module';
import { FileErrorMessageComponent } from '@features/bulk-upload-v2/file_error_message/file-error-message.component';
import { SharedModule } from '@shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { BulkUploadModule } from '../bulk-upload/bulk-upload.module';
import { BulkUploadPageV2Component } from './bulk-upload-page/bulk-upload-page.component';
import { BulkUploadSidebarComponent } from './bulk-upload-sidebar/bulk-upload-sidebar.component';
import { DragAndDropFilesListComponent } from './drag-and-drop-files-list/drag-and-drop-files-list.component';
import { DragAndDropFilesUploadComponent } from './drag-and-drop-files-upload/drag-and-drop-files-upload.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { BulkUploadErrorSummaryComponent } from './error-page/error-summary/error-summary.component';
import { FileValidateStatusComponent } from './file-validate-status/file-validate-status.component';
import { ErrorDetailsTableComponent } from './error-details-table/error-details-table.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    BulkUploadV2RoutingModule,
    BulkUploadModule,
    OverlayModule,
    NgxDropzoneModule,
  ],
  declarations: [
    BulkUploadPageV2Component,
    DragAndDropFilesUploadComponent,
    DragAndDropFilesListComponent,
    BulkUploadSidebarComponent,
    ErrorPageComponent,
    BulkUploadErrorSummaryComponent,
    FileErrorMessageComponent,
    FileValidateStatusComponent,
    ErrorDetailsTableComponent,
  ],
  providers: [DialogService, StaffReferencesResolver, WorkplacesReferencesResolver],
})
export class BulkUploadV2Module {}
