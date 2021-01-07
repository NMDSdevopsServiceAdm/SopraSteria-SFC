import { Component } from '@angular/core';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';

@Component({
  selector: 'app-bu-error-summary',
  templateUrl: './error-summary.component.html',
  providers: [{ provide: BulkUploadService, useClass: BulkUploadServiceV2 }],
})
export class BulkUploadErrorSummaryComponent {}
