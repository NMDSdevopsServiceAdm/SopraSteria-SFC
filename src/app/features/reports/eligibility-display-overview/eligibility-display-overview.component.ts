import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-eligibility-display-overview',
  templateUrl: './eligibility-display-overview.component.html'
})
export class EligibilityDisplayOverviewComponent {
  @Input() eligibility: string;
}
