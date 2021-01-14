import { Component, Input } from '@angular/core';
import { ErrorReportWarning } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-warning-details-table',
  templateUrl: './warning-details-table.component.html',
})
export class WarningDetailsTableComponent {
  @Input() warnings: ErrorReportWarning[];
  @Input() fileType: string;
}
