import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-funding-requirements-state',
  templateUrl: './funding-requirements-state.component.html',
})
export class FundingRequirementsStateComponent implements OnInit {
  @Input() overallWdfEligibility: boolean;
  @Input() currentWdfEligibility: boolean;
  @Input() singeStaffRecord: boolean;

  ngOnInit(): void {}
}
