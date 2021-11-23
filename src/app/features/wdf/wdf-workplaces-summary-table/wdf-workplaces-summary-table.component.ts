import { Component, Input, OnInit } from '@angular/core';
import { WdfParentSortWorkplacesOptions } from '@core/model/establishment.model';
import { DataPermissions, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import orderBy from 'lodash/orderBy';

@Component({
  selector: 'app-wdf-workplaces-summary-table',
  templateUrl: './wdf-workplaces-summary-table.component.html',
})
export class WdfWorkplacesSummaryTableComponent implements OnInit {
  @Input() public workplaces = [];
  public sortWorkplacesOptions;
  public sortBy: string;
  constructor(private permissionsService: PermissionsService) {}

  ngOnInit(): void {
    this.sortWorkplacesOptions = WdfParentSortWorkplacesOptions;
  }

  ngOnChanges() {
    this.sortByColumn('1_not_meeting');
  }

  public sortByColumn(selectedColumn: any) {
    switch (selectedColumn) {
      case '1_not_meeting': {
        this.workplaces = this.orderWorkplaces('asc');
        break;
      }
      case '2_meeting': {
        this.workplaces = this.orderWorkplaces('desc');
        break;
      }
      case '3_asc': {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.name.toLowerCase()], ['asc']);
        break;
      }
      case '4_dsc': {
        this.workplaces = orderBy(this.workplaces, [(workplace) => workplace.name.toLowerCase()], ['desc']);
        break;
      }
      default: {
        this.workplaces = this.workplaces = this.orderWorkplaces('asc');
        break;
      }
    }
  }

  public canViewWorkplace(workplace) {
    if (workplace.isParent === true) {
      return true;
    }
    return !(
      workplace.dataOwner === WorkplaceDataOwner.Workplace && workplace.dataPermissions === DataPermissions.None
    );
  }

  private orderWorkplaces(order: boolean | 'asc' | 'desc'): Array<any> {
    return orderBy(
      this.workplaces,
      [
        (workplace) => workplace.wdf.overall,
        (workplace) => workplace.wdf.workplace,
        (workplace) => workplace.wdf.staff,
      ],
      [order, order, order],
    );
  }
}
