import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-wdf-workplaces-summary-table',
  templateUrl: './wdf-workplaces-summary-table.component.html',
})
export class WdfWorkplacesSummaryTableComponent implements OnInit {
  @Input() workplaces = [];
  constructor() {}

  ngOnInit(): void {}
}
