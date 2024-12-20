import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-funding-requirements-state',
  templateUrl: './funding-requirements-state.component.html',
})
export class FundingRequirementsStateComponent {
  @Input() overallWdfEligibility: boolean;
  @Input() currentWdfEligibility: boolean;
  @Input() orangeFlagMessage: string;
}
