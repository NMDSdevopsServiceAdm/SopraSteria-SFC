import { Component, Input } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';
import * as moment from 'moment';

@Component({
  selector: 'app-wdf-update-warning',
  templateUrl: './wdf-update-warning.component.html',
})
export class WdfUpdateWarningComponent {
  @Input() report: WDFReport;

  get effectiveFromDateNextYear() {
    return moment(this.report.effectiveFrom).add(1, 'years').format('YYYY');
  }
}
