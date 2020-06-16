import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions, GetWorkplacesResponse, Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { filter, orderBy } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workplaces',
  templateUrl: './workplaces.component.html',
})
export class WorkplacesComponent implements OnInit {
  public workplaces: Workplace[] = [];
  public totalEligible: number;
  public totalIneligible: number;
  private subscriptions: Subscription = new Subscription();
  public primaryWorkplace: Establishment;
  public now: Date = new Date();
  public canDownloadWdfReport: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.REPORTS);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.canDownloadWdfReport = this.permissionsService.can(this.primaryWorkplace.uid, 'canDownloadWdfReport');

    this.subscriptions.add(
      this.userService.getEstablishments(true).subscribe((workplaces: GetWorkplacesResponse) => {
        if (workplaces.subsidaries) {
          this.workplaces = workplaces.subsidaries.establishments.filter(item => item.ustatus !== 'PENDING');

          if (this.workplaces.length) {
            this.workplaces = filter(this.workplaces, this.exclusionCheck);
          }

          this.workplaces = orderBy(this.workplaces, ['wdf.overall', 'updated'], ['asc', 'desc']);

          this.totalEligible = filter(this.workplaces, workplace => workplace.wdf.overall).length;
          this.totalIneligible = this.workplaces.length - this.totalEligible;
        }
      })
    );
  }

  public downloadWdfParentReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportService
        .getParentWDFReport(this.primaryWorkplace.uid)
        .subscribe(response => this.saveFile(response), () => {})
    );
  }

  private saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
  }

  /**
   * Exclude if dataOwner is 'Workplace' with no data permissions
   * @param w - Workplace
   */
  private exclusionCheck(w: Workplace): boolean {
    return w.dataOwner === WorkplaceDataOwner.Workplace && w.dataPermissions === DataPermissions.None ? false : true;
  }
}
