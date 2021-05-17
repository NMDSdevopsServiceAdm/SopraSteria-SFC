import { Component, Input, OnInit } from '@angular/core';
import { WdfParentSortStaffOptions } from '@core/model/establishment.model';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-wdf-workplaces-summary-table',
  templateUrl: './wdf-workplaces-summary-table.component.html',
})
export class WdfWorkplacesSummaryTableComponent implements OnInit {
  @Input() workplaces = [];
  public sortStaffOptions;
  public sortBy: string;

  constructor() {}

  ngOnInit(): void {
    this.sortStaffOptions = WdfParentSortStaffOptions;
  }

  ngOnChanges() {
    this.workplaces = this.workplaces.map((worker) => {
      worker.jobRole = worker.mainJob.other ? worker.mainJob.other : worker.mainJob.title;
      return worker;
    });
    this.workplaces = orderBy(this.workplaces, [(worker) => worker.nameOrId.toLowerCase()], ['asc']);
  }

  public sortByColumn(selectedColumn: any) {
    localStorage.setItem('SortBy', selectedColumn);
    switch (selectedColumn) {
      case '0_asc': {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.nameOrId.toLowerCase()], ['asc']);
        break;
      }
      case '0_dsc': {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.nameOrId.toLowerCase()], ['desc']);
        break;
      }
      case '1_asc': {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.jobRole.toLowerCase()], ['asc']);
        break;
      }
      case '1_dsc': {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.jobRole.toLowerCase()], ['desc']);
        break;
      }
      case '2_meeting': {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.wdfEligible], ['desc']);
        break;
      }
      case '2_not_meeting': {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.wdfEligible], ['asc']);
        break;
      }
      default: {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.nameOrId.toLowerCase()], ['asc']);
        break;
      }
    }
  }
}
