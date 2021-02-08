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
import { AboutBulkUploadComponent } from './about-bulk-upload/about-bulk-upload.component';
import { BulkUploadPageV2Component } from './bulk-upload-page/bulk-upload-page.component';
import { BulkUploadSidebarComponent } from './bulk-upload-sidebar/bulk-upload-sidebar.component';
import { BulkUploadStartPageComponent } from './bulk-upload-start-page/bulk-upload-start-page.component';
import { CodesAndGuidanceComponent } from './codes-and-guidance/codes-and-guidance.component';
import { DragAndDropFilesListComponent } from './drag-and-drop-files-list/drag-and-drop-files-list.component';
import { DragAndDropFilesUploadComponent } from './drag-and-drop-files-upload/drag-and-drop-files-upload.component';
import { ErrorDetailsTableComponent } from './error-page/error-details-table/error-details-table.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { BulkUploadErrorSummaryComponent } from './error-page/error-summary/error-summary.component';
import { WarningDetailsTableComponent } from './error-page/warning-details-table/warning-details-table.component';
import { FileValidateStatusComponent } from './file-validate-status/file-validate-status.component';
import { ValidationErrorMessageComponent } from './validation-error-message/validation-error-message.component';
import { LastBulkUploadComponent } from '@features/bulk-upload-v2/last-bulk-upload/last-bulk-upload.component';
import { LastBulkUploadResolver } from '@core/resolvers/last-bulk-upload.resolver';
import { BulkUploadErrorsResolver } from '@core/resolvers/bulk-upload-errors.resolver';

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
    WarningDetailsTableComponent,
    ValidationErrorMessageComponent,
    AboutBulkUploadComponent,
    BulkUploadStartPageComponent,
    CodesAndGuidanceComponent,
    LastBulkUploadComponent
  ],
  providers: [DialogService, StaffReferencesResolver, WorkplacesReferencesResolver,LastBulkUploadResolver,BulkUploadErrorsResolver],
})
export class BulkUploadV2Module {}
