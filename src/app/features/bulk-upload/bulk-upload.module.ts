import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkUploadPageComponent } from './bulk-upload-page/bulk-upload-page.component';
import { BulkUploadRoutingModule } from '@features/bulk-upload/bulk-upload-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BulkUploadRoutingModule
  ],
  declarations: [BulkUploadPageComponent]
})
export class BulkUploadModule {}
