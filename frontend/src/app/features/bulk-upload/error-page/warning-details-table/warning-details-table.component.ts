import { Component, Input } from '@angular/core';
import { ErrorReportWarning } from '@core/model/bulk-upload.model';

@Component({
    selector: 'app-warning-details-table',
    templateUrl: './warning-details-table.component.html',
    standalone: false
})
export class WarningDetailsTableComponent {
  @Input() warnings: ErrorReportWarning[];
  @Input() fileType: string;
  public openWarnings: number[] = [];

  public toggleDetails(warnCode: number, event) {
    event.preventDefault();
    const indexOfWarning = this.openWarnings.indexOf(warnCode);
    indexOfWarning > -1 ? this.openWarnings.splice(indexOfWarning, 1) : this.openWarnings.push(warnCode);
  }
}
