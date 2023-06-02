import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BenchmarksResponse, MetricsContent } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';
import { FormatUtil } from '@core/utils/format-util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-area-tab',
  templateUrl: './data-area-tab.component.html',
  styleUrls: ['./data-area-tab.component.scss'],
})
export class DataAreaTabComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() workplace: Establishment;
  //@Input() tilesData: BenchmarksResponse;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;

  public tilesData: BenchmarksResponse;
  public canViewFullBenchmarks: boolean;
  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  public viewBenchmarksByCategory = false;
  public viewBenchmarksComparisonGroups = false;
  public viewBenchmarksPosition = false;
  public downloadPayBenchmarksText = 'Download pay benchmarks';
  public downloadRecruitmentBenchmarksText = 'Download recruitment and retention benchmarks';
  public showRegisteredNurseSalary: boolean;
  public formatMoney = FormatUtil.formatMoney;
  public careWorkerPay;
  public seniorCareWorkerPay;
  public registeredNurseSalary;
  public registeredManagerSalary;
  public comparisionGroupCareWorkerPay;
  public comparisionGroupSeniorCareWorkerPay;
  public comparisionGroupRegisteredNurseSalary;
  public comparisionGroupRegisteredManagerSalary;

  constructor(
    private permissionsService: PermissionsService,
    private breadcrumbService: BreadcrumbService,
    private pdfService: PdfService,
    private elRef: ElementRef,
    protected benchmarksService: BenchmarksService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.breadcrumbService.show(JourneyType.BENCHMARKS_TAB);

    this.subscriptions.add(
      this.benchmarksService
        .getTileData(this.workplace.uid, ['sickness', 'turnover', 'pay', 'qualifications', 'careWorkerPay'])
        .subscribe((data) => {
          if (data) {
            this.tilesData = data;
            console.log(this.tilesData);

            this.showWorkplacePayAndSalary();
            this.showComparisionGroupPayAndSalary();
          }
        }),
    );

    this.setDownloadBenchmarksText();
    this.showRegisteredNurseSalary = this.workplace.mainService.id === 24 ? true : false;
    //this.showRegisteredNurseSalary = [24].includes(this.workplace.mainService.id);
    //this.showWorkplacePayAndSalary();
    //this.showComparisionGroupPayAndSalary();
  }

  public async downloadAsPDF() {
    return await this.pdfService.BuildBenchmarksPdf(
      this.elRef,
      this.aboutData.aboutData,
      this.workplace,
      'Benchmarks.pdf',
    );
  }

  public setDownloadBenchmarksText(): void {
    const pagesPay = '2';
    const fileSizePay = '430KB';
    const pagesRecruitment = '2';
    const fileSizeRecruitment = '385KB';
    this.downloadPayBenchmarksText = `${this.downloadPayBenchmarksText} (PDF, ${fileSizePay}, ${pagesPay} pages)`;
    this.downloadRecruitmentBenchmarksText = `${this.downloadRecruitmentBenchmarksText} (PDF, ${fileSizeRecruitment}, ${pagesRecruitment} pages)`;
  }

  public setReturn(): void {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }

  public handleViewBenchmarksByCategory(visible: boolean): void {
    this.viewBenchmarksByCategory = visible;
  }

  public handleViewComparisonGroups(visible: boolean): void {
    this.viewBenchmarksComparisonGroups = visible;
    this.showComparisionGroupPayAndSalary();
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }

  public showWorkplacePayAndSalary(): void {
    this.careWorkerPay = `${this.formatMoney(this.tilesData?.careWorkerPay.workplaceValue.value)} (hourly)`;
    this.seniorCareWorkerPay = `${this.formatMoney(this.tilesData?.seniorCareWorkerPay.workplaceValue.value)} (hourly)`;
    this.registeredNurseSalary = `${this.formatMoney(
      this.tilesData?.registeredNursePay.workplaceValue.value,
    )} (annually)`;
    this.registeredManagerSalary = `${this.formatMoney(
      this.tilesData?.registeredManagerPay.workplaceValue.value,
    )} (annually)`;
  }

  public showComparisionGroupPayAndSalary(): void {
    if (this.viewBenchmarksComparisonGroups) {
      this.comparisionGroupCareWorkerPay = '£9.96';
      this.comparisionGroupSeniorCareWorkerPay = '£11.96';
      this.comparisionGroupRegisteredNurseSalary = '£35,550';
      this.comparisionGroupRegisteredManagerSalary = '£36,185';
      console.log(this.comparisionGroupCareWorkerPay);
      return;
    }
    this.comparisionGroupCareWorkerPay = `${this.formatMoney(
      this.tilesData?.careWorkerPay.comparisonGroup.value,
    )} (hourly)`;
    this.comparisionGroupSeniorCareWorkerPay = '£11.50';
    this.comparisionGroupRegisteredNurseSalary = '£34,100';
    this.comparisionGroupRegisteredManagerSalary = '£36,185';
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
    this.subscriptions.unsubscribe();
  }
}
