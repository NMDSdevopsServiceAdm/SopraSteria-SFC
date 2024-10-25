import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Page } from '@core/model/page.model';
import { WDFReport } from '@core/model/reports.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-funding-requirements',
  templateUrl: './funding-requirements.component.html',
})
export class FundingRequirementsComponent implements OnInit {
  public workplace: Establishment;
  public pages: Page;
  private subscriptions: Subscription = new Subscription();
  public wdfStartDate: string;
  public wdfEndDate: string;

  constructor(
    private establishmentService: EstablishmentService,
    private reportService: ReportService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.WDF);
    this.workplace = this.establishmentService.establishment;
    this.pages = this.route.snapshot.data.pages?.data[0];
    this.getWdfReportForDates();
  }

  private getWdfReportForDates(): void {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplace.uid).subscribe((report) => {
        this.wdfStartDate = dayjs(report.effectiveFrom).format('D MMMM YYYY');
        this.wdfEndDate = dayjs(report.effectiveFrom).add(1, 'years').format('D MMMM YYYY');
      }),
    );
  }

  public viewFundingOverviewPage(): void {
    this.router.navigate(['/wdf']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
