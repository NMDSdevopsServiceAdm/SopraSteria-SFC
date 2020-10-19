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
      margin: [20, 15, 80, 15],
    },
    series: [
      {
        accessibility: {
          description: 'Your average pay compared to your comparison group',
          enabled: true,
        },
        data: [
          { y: 8.58, color: '#28a197', name: 'Your workplace' },
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
            const size = this.key === 'Your workplace' ? 'govuk-heading-xl' : 'govuk-heading-m';
            return '<span class="' + size + ' govuk-!-margin-bottom-2">£' + this.y + '</span>';
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

  gauge: Highcharts.Options = {
    chart: {
      type: 'bar',
      margin: [100, 15, 35, 15],
    },
    credits: { enabled: false },
    exporting: { enabled: false },
    legend: { enabled: false },
    title: { text: '' },
    xAxis: {
      tickLength: 0,
      lineWidth: 0,
      max: 1,
    },
    yAxis: {
      min: 1,
      max: 45,
      reversed: true,
      gridLineWidth: 0,
      title: { text: '' },
      tickAmount: 2,
      startOnTick: false,
      endOnTick: false,
      maxPadding: 0,
      tickPositioner: function () {
        return [1, 45];
      },
      labels: {
        y: 20,
        padding: 5,
        useHTML: true,
        formatter: function () {
          if (this.value === 1) {
            return (
              '<span class="govuk-body">Highest ranking <span class="govuk-!-font-weight-bold govuk-!-margin-left-4">' +
              this.value +
              '</span></span>'
            );
          }
          return (
            '<span class="govuk-body"><span class="govuk-!-font-weight-bold govuk-!-margin-right-4">' +
            this.value +
            '</span>Lowest ranking</span>'
          );
        },
      },
      plotBands: [
        {
          from: 1,
          to: 45,
          color: {
            linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
            stops: [
              [0, '#CB0101'], // start
              [0.5, '#E35704'], // middle
              [1, '#19963C'], // end
            ],
          },
        },
      ],
    },
    series: [
      {
        name: 'Target',
        type: 'scatter',
        data: [[23, 23]],
        dataLabels: {
          enabled: true,
          padding: 0,
          useHTML: true,
          formatter: function () {
            return '<span class="govuk-heading-xl govuk-!-margin-bottom-2">' + this.y + '</span>';
          },
          crop: false,
          overflow: 'allow',
        },
      },
    ],
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      series: {
        animation: false,
      },
      bar: {},
      scatter: {
        marker: {
          symbol:
            'url( data:image/png;base64,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)',
        },
      },
    },
  };

  // chart1.series[0].points[0].update({x:0,y:60}, true, {duration: 1000});

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
