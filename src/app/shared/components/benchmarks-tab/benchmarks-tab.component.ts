import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BenchmarksResponse, MetricsContent } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PdfService } from '@core/services/pdf.service';
import { CloneObjectUtil } from '@core/utils/cloneObject-util';
import { Subscription } from 'rxjs';

import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html',
  styleUrls: ['./benchmarks-tab.component.scss'],
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() workplace: Establishment;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;

  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  private tile = {
    value: 0,
    hasValue: false,
  };
  private tilesValues = {
    workplaceValue: CloneObjectUtil.clone(this.tile),
    comparisonGroup: CloneObjectUtil.clone(this.tile),
    goodCqc: CloneObjectUtil.clone(this.tile),
    lowTurnover: CloneObjectUtil.clone(this.tile),
  };
  public tilesData: BenchmarksResponse = {
    tiles: {
      pay: CloneObjectUtil.clone(this.tilesValues),
      sickness: CloneObjectUtil.clone(this.tilesValues),
      qualifications: CloneObjectUtil.clone(this.tilesValues),
      turnover: CloneObjectUtil.clone(this.tilesValues),
    },
    meta: {
      workplaces: 0,
      staff: 0,
    },
  };
  private elref: ElementRef<any>;

  constructor(private benchmarksService: BenchmarksService, private elRef: ElementRef, private pdfService: PdfService) {
    this.elref = elRef;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.benchmarksService
        .getTileData(this.workplace.uid, ['sickness', 'turnover', 'pay', 'qualifications'])
        .subscribe((data) => {
          if (data) {
            this.tilesData = data;
          }
        }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public async downloadAsPDF($event: Event) {
    $event.preventDefault();
    try {
      return await this.pdfService.BuildBenchmarksPdf(this.elRef, this.aboutData.aboutData, this.workplace);
    } catch (error) {
      console.error(error);
    }
  }
}
