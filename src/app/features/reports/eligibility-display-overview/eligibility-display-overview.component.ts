import { Component, Input } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';

@Component({
  selector: 'app-eligibility-display-overview',
  templateUrl: './eligibility-display-overview.component.html',
})
export class EligibilityDisplayOverviewComponent {
  @Input() eligibility: WDFReport;
}
