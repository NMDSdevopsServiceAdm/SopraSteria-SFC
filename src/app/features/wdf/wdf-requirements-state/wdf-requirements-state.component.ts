import { Component, Input } from '@angular/core';

import { Worker } from '../../../core/model/worker.model';

@Component({
  selector: 'app-wdf-requirements-state',
  templateUrl: './wdf-requirements-state.component.html',
})
export class WdfRequirementsStateComponent {
  @Input() overallWdfEligibility: boolean;
  @Input() worker: Worker;
}
