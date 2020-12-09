import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StaffReferencesResolver } from '@core/resolvers/staff-references.resolver';
import { WorkplacesReferencesResolver } from '@core/resolvers/workplace-references.resolver';
import { DialogService } from '@core/services/dialog.service';
import { BulkUploadV2RoutingModule } from '@features/bulk-upload/v2/bulk-upload-routing.module';
import { SharedModule } from '@shared/shared.module';
import { BulkUploadModule } from '../bulk-upload.module';

import { BulkUploadPageV2Component } from './bulk-upload-page/bulk-upload-page.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    BulkUploadV2RoutingModule,
    BulkUploadModule,
    OverlayModule,
  ],
  declarations: [BulkUploadPageV2Component],
  providers: [DialogService, StaffReferencesResolver, WorkplacesReferencesResolver],
})
export class BulkUploadV2Module {}
