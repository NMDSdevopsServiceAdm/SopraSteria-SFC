import { Component, Input } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';

@Component({
  selector: 'app-wdf-eligibility',
  templateUrl: './wdf-eligibility.component.html',
})
export class WdfEligibilityComponent {
  @Input() set report(report: WDFReport) {
    this.criteria = [
      {
        label: 'Overall',
        truthy: report.wdf.overall,
      },
      {
        label: 'Workplace information',
        truthy: report.wdf.workplace,
      },
      {
        label: 'Staff records',
        truthy: report.wdf.staff,
      },
    ];
  }

  public criteria: Array<{ label: string; truthy: boolean }>;
}
