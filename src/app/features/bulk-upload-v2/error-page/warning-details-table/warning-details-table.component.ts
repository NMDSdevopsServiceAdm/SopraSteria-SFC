import { Component, Input } from '@angular/core';
import { ErrorReportWarning } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-warning-details-table',
  templateUrl: './warning-details-table.component.html',
})
export class WarningDetailsTableComponent {
  @Input() warnings: ErrorReportWarning[];
  @Input() fileType: string;
  private openWarnings: string[] = [];

  public toggleDetails(warnCode: string, event) {
    event.preventDefault();
    const indexOfWarning = this.openWarnings.indexOf(warnCode);
    indexOfWarning > -1 ? this.openWarnings.splice(indexOfWarning, 1) : this.openWarnings.push(warnCode);
  }
}
