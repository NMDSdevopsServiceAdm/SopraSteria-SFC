import { Component, Input } from '@angular/core';
import { ErrorReportError } from '@core/model/bulk-upload.model';

@Component({
    selector: 'app-error-details-table',
    templateUrl: './error-details-table.component.html',
    standalone: false
})
export class ErrorDetailsTableComponent {
  @Input() errors: ErrorReportError[];
  @Input() fileType: string;
  public openErrors: number[] = [];

  public toggleDetails(errCode: number, event) {
    event.preventDefault();
    const indexOfError = this.openErrors.indexOf(errCode);
    indexOfError > -1 ? this.openErrors.splice(indexOfError, 1) : this.openErrors.push(errCode);
  }
}
