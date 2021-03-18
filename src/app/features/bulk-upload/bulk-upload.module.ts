import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LastBulkUploadResolver } from '@core/resolvers/last-bulk-upload.resolver';
import { MissingWorkplacesReferencesResolver } from '@core/resolvers/missing-workplace-references.resolver';
import { StaffReferencesResolver } from '@core/resolvers/staff-references.resolver';
import { WorkplacesReferencesResolver } from '@core/resolvers/workplace-references.resolver';
import { DialogService } from '@core/services/dialog.service';
import { SharedModule } from '@shared/shared.module';

import { ReferencesCreatedPageComponent } from './references-created-page/references-created-page.component';
import { ReportDownloadLinkComponent } from './report-download-link/report-download-link.component';
import { UploadWarningDialogComponent } from './upload-warning-dialog/upload-warning-dialog.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule],
  declarations: [UploadWarningDialogComponent, ReportDownloadLinkComponent, ReferencesCreatedPageComponent],
  exports: [UploadWarningDialogComponent, ReportDownloadLinkComponent, ReferencesCreatedPageComponent],
  providers: [
    DialogService,
    StaffReferencesResolver,
    WorkplacesReferencesResolver,
    MissingWorkplacesReferencesResolver,
    LastBulkUploadResolver,
  ],
})
export class BulkUploadModule {}
