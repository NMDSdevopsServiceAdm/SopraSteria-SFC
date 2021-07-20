import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-wdf-requirements-state',
  templateUrl: './wdf-requirements-state.component.html',
})
export class WdfRequirementsStateComponent {
  @Input() overallWdfEligibility: boolean;
  @Input() currentWdfEligibility: boolean;
}
