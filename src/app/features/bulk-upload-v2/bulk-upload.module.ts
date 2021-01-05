import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StaffReferencesResolver } from '@core/resolvers/staff-references.resolver';
import { WorkplacesReferencesResolver } from '@core/resolvers/workplace-references.resolver';
import { DialogService } from '@core/services/dialog.service';
import { BulkUploadV2RoutingModule } from '@features/bulk-upload-v2/bulk-upload-routing.module';
import { SharedModule } from '@shared/shared.module';
import { BulkUploadModule } from '../bulk-upload/bulk-upload.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { BulkUploadPageV2Component } from './bulk-upload-page/bulk-upload-page.component';
import { DragAndDropFilesUploadComponent } from './drag-and-drop-files-upload/drag-and-drop-files-upload.component';
import { DragAndDropFilesListComponent } from './drag-and-drop-files-list/drag-and-drop-files-list.component';
import { BulkUploadSidebarComponent } from './bulk-upload-sidebar/bulk-upload-sidebar.component';
import { FileValidateStatusComponent } from './file-validate-status/file-validate-status.component';

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
    FileValidateStatusComponent,
  ],
  providers: [DialogService, StaffReferencesResolver, WorkplacesReferencesResolver],
})
export class BulkUploadV2Module {}
