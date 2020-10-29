import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BenchmarksResponse, MetricsContent } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PdfService } from '@core/services/pdf.service';
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

  public tilesData: BenchmarksResponse = {
    tiles: {
      pay: {
        workplaceValue: {
          value: 0,
          hasValue: false,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
        },
        goodCqc: {
          value: 0,
          hasValue: false,
        },
        lowTurnover: {
          value: 0,
          hasValue: false,
        },
      },
      sickness: {
        workplaceValue: {
          value: 0,
          hasValue: false,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
        },
        goodCqc: {
          value: 0,
          hasValue: false,
        },
        lowTurnover: {
          value: 0,
          hasValue: false,
        },
      },
      qualifications: {
        workplaceValue: {
          value: 0,
          hasValue: false,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
        },
        goodCqc: {
          value: 0,
          hasValue: false,
        },
        lowTurnover: {
          value: 0,
          hasValue: false,
        },
      },
      turnover: {
        workplaceValue: {
          value: 0,
          hasValue: false,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
        },
        goodCqc: {
          value: 0,
          hasValue: false,
        },
        lowTurnover: {
          value: 0,
          hasValue: false,
        },
      },
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
