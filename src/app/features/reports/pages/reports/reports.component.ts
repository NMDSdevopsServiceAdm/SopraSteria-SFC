import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public primaryWorkplace: Establishment;
  public canRunLocalAuthorityReport: boolean;
  public isAdmin: boolean;
  public isParent: boolean;
  public isLocalAuthority: boolean;
  public now: Date = new Date();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private reportsService: ReportService,
    private userService: UserService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.REPORTS);
    this.isAdmin = [Roles.Admin].includes(this.userService.loggedInUser.role);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.subscriptions.add(
      this.establishmentService.establishment$.pipe(take(1)).subscribe(workplace => {
        this.workplace = workplace;
        this.isParent = this.primaryWorkplace ? this.primaryWorkplace.isParent : workplace.isParent;
        this.isLocalAuthority = workplace.employerType && workplace.employerType.value.startsWith('Local Authority');
        this.canRunLocalAuthorityReport =
          this.isParent &&
          this.isLocalAuthority &&
          this.permissionsService.can(workplace.uid, 'canRunLocalAuthorityReport');
      })
    );
  }

  public downloadWdfSummaryReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getWdfSummaryReport().subscribe(response => this.saveFile(response), () => {})
    );
  }

  public downloadLocalAuthorityReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService
        .getLocalAuthorityReport(this.workplace.uid)
        .subscribe(response => this.saveFile(response), () => {})
    );
  }

  public downloadLocalAuthorityAdminReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getLocalAuthorityAdminReport().subscribe(response => this.saveFile(response), () => {})
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
