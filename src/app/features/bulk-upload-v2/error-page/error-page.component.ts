import { Component } from '@angular/core';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  providers: [{ provide: BulkUploadService, useClass: BulkUploadServiceV2 }],
})
export class ErrorPageComponent {}
