import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-wdf-requirements-state',
  templateUrl: './wdf-requirements-state.component.html',
})
export class WdfRequirementsStateComponent implements OnInit {
  @Input() overallWdfEligibility: boolean;
  @Input() currentWdfEligibility: boolean;

  ngOnInit(): void {
    console.log(this.currentWdfEligibility);
  }
}
