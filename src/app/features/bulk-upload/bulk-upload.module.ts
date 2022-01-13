import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BulkUploadErrorsResolver } from '@core/resolvers/bulk-upload-errors.resolver';
import { BulkUploadTopTipResolver } from '@core/resolvers/bulk-upload/bulk-upload-top-tip.resolver';
import { BulkUploadTopTipsListResolver } from '@core/resolvers/bulk-upload/bulk-upload-top-tips-list.resolver';
import { LastBulkUploadResolver } from '@core/resolvers/last-bulk-upload.resolver';
import { MissingWorkplacesReferencesResolver } from '@core/resolvers/missing-workplace-references.resolver';
import { StaffReferencesResolver } from '@core/resolvers/staff-references.resolver';
import { WorkplacesReferencesResolver } from '@core/resolvers/workplace-references.resolver';
import { DialogService } from '@core/services/dialog.service';
import { MissingStaffReferencesComponent } from '@features/bulk-upload/bulk-upload-references/missing-staff-references/missing-staff-references-page.component';
import { MissingWorkplaceReferencesComponent } from '@features/bulk-upload/bulk-upload-references/missing-workplace-references/missing-workplace-references-page.component';
import { BulkUploadRoutingModule } from '@features/bulk-upload/bulk-upload-routing.module';
import { FileErrorMessageComponent } from '@features/bulk-upload/file_error_message/file-error-message.component';
import { LastBulkUploadComponent } from '@features/bulk-upload/last-bulk-upload/last-bulk-upload.component';
import { SharedModule } from '@shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { AboutBulkUploadComponent } from './about-bulk-upload/about-bulk-upload.component';
import { BulkUploadMissingPageComponent } from './bulk-upload-missing/bulk-upload-missing-page.component';
import { BulkUploadPageComponent } from './bulk-upload-page/bulk-upload-page.component';
import { MissingReferencesToggleComponent } from './bulk-upload-references/missing-references-toggle/missing-references-toggle.component';
import { MissingRefsSubmitExitButtonsComponent } from './bulk-upload-references/missing-refs-submit-exit-buttons/missing-refs-submit-exit-buttons.component';
import { StaffReferencesComponent } from './bulk-upload-references/staff-references/staff-references-page.component';
import { WorkplaceReferencesComponent } from './bulk-upload-references/workplace-references/workplace-references-page.component';
import { BulkUploadDownloadCurrentDataComponent } from './bulk-upload-sidebar/bulk-upload-download-current-data/bulk-upload-download-current-data.component';
import { BulkUploadRelatedContentComponent } from './bulk-upload-sidebar/bulk-upload-related-content/bulk-upload-related-content.component';
import { BulkUploadStartPageComponent } from './bulk-upload-start-page/bulk-upload-start-page.component';
import { BulkUploadTroubleshootingComponent } from './bulk-upload-troubleshooting-page/bulk-upload-troubleshooting-page.component';
import { CodesAndGuidanceComponent } from './codes-and-guidance/codes-and-guidance.component';
import { DragAndDropFilesListComponent } from './drag-and-drop-files-list/drag-and-drop-files-list.component';
import { DragAndDropFilesUploadComponent } from './drag-and-drop-files-upload/drag-and-drop-files-upload.component';
import { ErrorDetailsTableComponent } from './error-page/error-details-table/error-details-table.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { BulkUploadErrorSummaryComponent } from './error-page/error-summary/error-summary.component';
import { WarningDetailsTableComponent } from './error-page/warning-details-table/warning-details-table.component';
import { FileValidateStatusComponent } from './file-validate-status/file-validate-status.component';
import { BulkUploadHelpMainPageComponent } from './help-area/bulk-upload-help-main-page.component';
import { BulkUploadTopTipPageComponent } from './help-area/bulk-upload-top-tip-page/bulk-upload-top-tip-page.component';
import { ReportDownloadLinkComponent } from './report-download-link/report-download-link.component';
import { UploadWarningDialogComponent } from './upload-warning-dialog/upload-warning-dialog.component';
import { ValidationErrorMessageComponent } from './validation-error-message/validation-error-message.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    BulkUploadRoutingModule,
    OverlayModule,
    NgxDropzoneModule,
    FormsModule,
  ],
  declarations: [
    BulkUploadPageComponent,
    DragAndDropFilesUploadComponent,
    DragAndDropFilesListComponent,
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
    MissingRefsSubmitExitButtonsComponent,
    UploadWarningDialogComponent,
    ReportDownloadLinkComponent,
    BulkUploadHelpMainPageComponent,
    BulkUploadTroubleshootingComponent,
    BulkUploadTopTipPageComponent,
  ],
  providers: [
    DialogService,
    StaffReferencesResolver,
    WorkplacesReferencesResolver,
    MissingWorkplacesReferencesResolver,
    LastBulkUploadResolver,
    BulkUploadErrorsResolver,
    BulkUploadTopTipsListResolver,
    BulkUploadTopTipResolver,
  ],
})
export class BulkUploadModule {}
