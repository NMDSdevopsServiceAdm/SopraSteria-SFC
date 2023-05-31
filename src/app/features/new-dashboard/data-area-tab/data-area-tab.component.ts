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

@Component({
  selector: 'app-data-area-tab',
  templateUrl: './data-area-tab.component.html',
  styleUrls: ['./data-area-tab.component.scss'],
})
export class DataAreaTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() tilesData: BenchmarksResponse;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;

  public canViewFullBenchmarks: boolean;
  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  public viewBenchmarksByCategory = false;
  public viewBenchmarksComparisonGroups = false;
  public viewBenchmarksPosition = false;
  public mainServiceOneId = 24;
  public showRegisteredNurseSalary: boolean;
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
    this.showRegisteredNurseSalary = this.workplace.mainService.id === this.mainServiceOneId ? true : false;
    this.showWorkplacePayAndSalary();
    this.showComparisionGroupPayAndSalary();
  }

  public async downloadAsPDF() {
    return await this.pdfService.BuildBenchmarksPdf(
      this.elRef,
      this.aboutData.aboutData,
      this.workplace,
      'Benchmarks.pdf',
    );
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
    this.careWorkerPay = FormatUtil.formatMoney(1026);
    this.seniorCareWorkerPay = FormatUtil.formatMoney(1105);
    this.registeredNurseSalary = '£34,130';
    this.registeredManagerSalary = '£35,637';
  }

  public showComparisionGroupPayAndSalary() {
    if (this.viewBenchmarksComparisonGroups) {
      this.comparisionGroupCareWorkerPay = '£9.96';
      this.comparisionGroupSeniorCareWorkerPay = '£11.96';
      this.comparisionGroupRegisteredNurseSalary = '£35,550';
      this.comparisionGroupRegisteredManagerSalary = '£36,185';
      return;
    }
    this.comparisionGroupCareWorkerPay = '£9.75';
    this.comparisionGroupSeniorCareWorkerPay = '£11.50';
    this.comparisionGroupRegisteredNurseSalary = '£34,100';
    this.comparisionGroupRegisteredManagerSalary = '£36,185';
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }
}
