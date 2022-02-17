import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { WDFReport } from '@core/model/reports.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wdf-workplaces-summary',
  templateUrl: './wdf-workplaces-summary.component.html',
})
export class WdfWorkplacesSummaryComponent implements OnInit {
  public workplaces = [];
  public workplaceUid: string;
  public wdfStartDate: string;
  public wdfEndDate: string;
  public returnUrl: URLStructure;
  public report: WDFReport;
  public parentOverallEligibilityStatus: boolean;
  public parentCurrentEligibilityStatus: boolean;
  public parentOverallEligibilityDate: string;
  public now: Date = new Date();
  private subscriptions: Subscription = new Subscription();
  public canDownloadReport: boolean;

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    private route: ActivatedRoute,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WDF_PARENT);
    this.returnUrl = { url: ['/wdf', 'workplaces'] };

    this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.canDownloadReport = this.permissionsService.can(this.workplaceUid, 'canEditEstablishment');
    this.getParentAndSubs();
    this.getWdfReport();
  }

  private getParentAndSubs(): void {
    this.subscriptions.add(
      this.userService.getEstablishments(true).subscribe((workplaces: GetWorkplacesResponse) => {
        if (workplaces.subsidaries) {
          this.workplaces = workplaces.subsidaries.establishments.filter((item) => item.ustatus !== 'PENDING');
        }
        this.workplaces.push(workplaces.primary);
        this.workplaces = orderBy(this.workplaces, ['wdf.overall', 'updated'], ['asc', 'desc']);
        this.getParentWdfEligibility();
      }),
    );
  }

  private getParentWdfEligibility(): void {
    this.parentOverallEligibilityStatus = !this.workplaces.some((workplace) => {
      return workplace.wdf.overall === false;
    });
    this.parentCurrentEligibilityStatus = !this.workplaces.some((workplace) => {
      return workplace.wdf.workplace === false || workplace.wdf.staff === false;
    });
  }

  private getWdfReport() {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplaceUid).subscribe((report) => {
        this.report = report;
        this.setDates(report);
      }),
    );
  }

  private setDates(report: WDFReport): void {
    this.wdfStartDate = dayjs(report.effectiveFrom).format('D MMMM YYYY');
    this.wdfEndDate = dayjs(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
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
}
