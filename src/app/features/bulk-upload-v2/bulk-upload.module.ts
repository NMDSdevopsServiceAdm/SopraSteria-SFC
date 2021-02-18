import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BulkUploadErrorsResolver } from '@core/resolvers/bulk-upload-errors.resolver';
import { LastBulkUploadResolver } from '@core/resolvers/last-bulk-upload.resolver';
import { StaffReferencesResolver } from '@core/resolvers/staff-references.resolver';
import { WorkplacesReferencesResolver } from '@core/resolvers/workplace-references.resolver';
import { DialogService } from '@core/services/dialog.service';
import { BulkUploadV2RoutingModule } from '@features/bulk-upload-v2/bulk-upload-routing.module';
import { FileErrorMessageComponent } from '@features/bulk-upload-v2/file_error_message/file-error-message.component';
import { LastBulkUploadComponent } from '@features/bulk-upload-v2/last-bulk-upload/last-bulk-upload.component';
import { SharedModule } from '@shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { BulkUploadModule } from '../bulk-upload/bulk-upload.module';
import { AboutBulkUploadComponent } from './about-bulk-upload/about-bulk-upload.component';
import { BulkUploadMissingPageComponent } from './bulk-upload-missing/bulk-upload-missing-page.component';
import { BulkUploadPageV2Component } from './bulk-upload-page/bulk-upload-page.component';
import { StaffReferencesComponent } from './bulk-upload-references/staff-references/staff-references-page.component';
import { WorkplaceReferencesComponent } from './bulk-upload-references/workplace-references/workplace-references-page.component';
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
import { BulkUploadRelatedContentComponent } from './bulk-upload-sidebar/bulk-upload-related-content/bulk-upload-related-content.component';
import { BulkUploadDownloadCurrentDataComponent } from './bulk-upload-sidebar/bulk-upload-download-current-data/bulk-upload-download-current-data.component';
import { MissingWorkplaceReferencesComponent } from '@features/bulk-upload-v2/bulk-upload-references/missing-workplace-references/missing-workplace-references-page.component';
import { MissingStaffReferencesComponent } from '@features/bulk-upload-v2/bulk-upload-references/missing-staff-references/missing-staff-references-page.component';
import { MissingReferencesToggleComponent } from './bulk-upload-references/missing-references-toggle/missing-references-toggle.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    BulkUploadV2RoutingModule,
    BulkUploadModule,
    OverlayModule,
    NgxDropzoneModule,
    FormsModule,
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
    WorkplaceReferencesComponent,
    StaffReferencesComponent,
    MissingWorkplaceReferencesComponent,
    MissingStaffReferencesComponent,
    AboutBulkUploadComponent,
    BulkUploadStartPageComponent,
    CodesAndGuidanceComponent,
    LastBulkUploadComponent,
    BulkUploadMissingPageComponent,
    BulkUploadRelatedContentComponent,
    BulkUploadDownloadCurrentDataComponent,
    MissingReferencesToggleComponent,
  ],
  providers: [
    DialogService,
    StaffReferencesResolver,
    WorkplacesReferencesResolver,
    LastBulkUploadResolver,
    BulkUploadErrorsResolver,
  ],
})
export class BulkUploadV2Module {}
