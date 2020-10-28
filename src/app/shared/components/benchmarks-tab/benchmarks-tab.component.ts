import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
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

  public formatPercent(data) {
    return Math.round(data * 100) + '%';
  }
  public formatPay(data) {
    return '£' + (Number(data) / 100).toFixed(2);
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
