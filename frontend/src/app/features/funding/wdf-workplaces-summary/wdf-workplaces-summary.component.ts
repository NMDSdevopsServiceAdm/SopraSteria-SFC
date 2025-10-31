import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FundingParentSortWorkplacesOptions } from '@core/model/establishment.model';
import { DataPermissions, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import saveAs from 'file-saver';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-wdf-workplaces-summary',
    templateUrl: './wdf-workplaces-summary.component.html',
    standalone: false
})
export class WdfWorkplacesSummaryComponent implements OnInit, OnDestroy {
  @Input() workplaces = [];
  public workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  public canDownloadReport: boolean;
  public sortWorkplacesOptions = FundingParentSortWorkplacesOptions;

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.canDownloadReport = this.permissionsService.can(this.workplaceUid, 'canEditEstablishment');
  }

  public downloadWdfParentReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportService.getParentWDFReport(this.workplaceUid).subscribe(
        (response) => this.saveFile(response),
        (error) => console.error(error),
      ),
    );
  }

  public saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
