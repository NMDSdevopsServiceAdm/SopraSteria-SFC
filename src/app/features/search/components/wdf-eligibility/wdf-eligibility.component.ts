import { Component, Input, OnInit } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';

@Component({
  selector: 'app-wdf-eligibility',
  templateUrl: './wdf-eligibility.component.html',
})
export class WdfEligibilityComponent implements OnInit {
  @Input() report: WDFReport;

  public criteria: Array<{ label: string; truthy: boolean }>;

  ngOnInit() {
    this.criteria = [
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
