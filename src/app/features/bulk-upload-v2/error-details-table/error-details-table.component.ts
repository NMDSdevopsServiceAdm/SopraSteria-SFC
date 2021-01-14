import { Component, Input } from '@angular/core';
import { ErrorReportError } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-error-details-table',
  templateUrl: './error-details-table.component.html',
  styleUrls: ['./error-details-table.component.scss'],
})
export class ErrorDetailsTableComponent {
  @Input() errors: ErrorReportError[];
}
