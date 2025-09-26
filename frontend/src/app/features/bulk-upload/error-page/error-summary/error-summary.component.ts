import { Component, Input } from '@angular/core';
import { NumberOfErrorsAndWarnings } from '@core/model/bulk-upload.model';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';

@Component({
    selector: 'app-bu-error-summary',
    templateUrl: './error-summary.component.html',
    providers: [{ provide: BulkUploadService, useClass: BulkUploadServiceV2 }],
    standalone: false
})
export class BulkUploadErrorSummaryComponent {
  @Input() numberOfErrorsAndWarnings: NumberOfErrorsAndWarnings;
}
