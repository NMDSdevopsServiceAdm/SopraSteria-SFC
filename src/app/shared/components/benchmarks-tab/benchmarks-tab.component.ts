import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PdfService } from '@core/services/pdf.service';
import * as Highcharts from 'highcharts';
import { Subscription } from 'rxjs';

import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html',
  styleUrls: ['./benchmarks-tab.component.scss'],
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      margin: [20, 0, 80, 0],
      scrollablePlotArea: {
        minWidth: 700,
      },
    },
    series: [
      {
        accessibility: {
          description: 'Your average pay compared to your comparison group',
          enabled: true,
        },
        data: [
          { y: null, color: '#28a197', name: 'Your workplace' },
          { y: 8.42, name: 'Comparison group' },
          { y: 8.78, name: 'Good and outstanding CQC providers in your comparison group' },
          { y: 8.5, name: 'Workplaces with a low turnover rate in your comparison group' },
        ],
        type: 'column',
        color: '#6F72AF',
        dataLabels: {
          enabled: true,
          align: 'left',
          padding: 0,
          useHTML: true,
          formatter: function () {
            console.log(this);
            const size = this.key === 'Your workplace' ? 'govuk-heading-xl' : 'govuk-heading-m';
            return '<span class="' + size + ' govuk-!-margin-bottom-2">' + this.y + '</span>';
          },
          nullFormatter: function () {
            console.log(this);
            return 'this value is null';
          },
          crop: false,
          overflow: 'allow',
        },
        showInLegend: false,
        groupPadding: 0,
        pointPadding: 0.03,
      },
    ],
    yAxis: {
      visible: false,
    },
    xAxis: {
      type: 'category',
      labels: {
        useHTML: true,
        formatter: function () {
          const bold = this.isFirst ? 'govuk-!-font-weight-bold' : 'govuk-!-font-weight-regular';
          return '<span class="govuk-body ' + bold + '">' + this.value + '</span>';
        },
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            xAxis: {},
          },
        },
      ],
    },
    tooltip: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
  };

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
