import { Component, Input } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';

@Component({
  selector: 'app-eligibility-display-overview',
  templateUrl: './eligibility-display-overview.component.html',
})
export class EligibilityDisplayOverviewComponent {
  @Input() report: WDFReport;

  get criteria() {
    return [
      {
        label: 'Overall',
        truthy: this.report.wdf.isEligible,
      },
      {
        label: 'Workplace information',
        truthy: this.report.wdf.workplace,
      },
      {
        label: 'Staff records',
        truthy: this.report.wdf.staff,
      },
    ];
  }
}
