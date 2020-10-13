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
      tickAmount: 2,
      gridLineWidth: 0,
      title: { text: '' },
      startOnTick: true,
      endOnTick: true,
      maxPadding: 0,
      labels: {
        y: 20,
        padding: 5,
        useHTML: true,
        formatter: function () {
          return '<span class="govuk-body">' + this.value + '</span>';
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
            'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHCSURBVFhHxZZdSgJRGIabsm5aQj9EdNUChHZRFhVCG4hWErSGLrwJoiiKltJ1UEQ/F2Vm/s/0vHJOSI6OM84ZH3hQxnO+9/NzPDo1CYIgmMZ1/DCXsoFAD9fwDv1MGyAshwfYQcunedkdhCi4iO+od92LuwYornGv4i3+D7aUzfL0oKiCV/AG2zgoXHyZbelAQd3d+/iGw4It6TRAIQXv4Sv23mRRVEyJ5FBkCa9R445L8gbYrOArbOEo4w7j25SLBxt38AWTBlviNcCGbXzGJOMOo2pKD4eFC3iJTe1KkapnMgbCohIPu5jDaV1LkdrAggRv4SNPiziHaYcLr28ChOZ5OMNFnNU1h9TD3pWC66iRuyZ0AmpqBguoz9/lFBp9E/A8z8cWT89xHk+wgy6I/BJ0J4LLqFMvzjk/Cg0TEw2L9TOrE/Aexz0BLU1TPh5s1Ik4zm+ARR91cihwjDodkzYyXgOCIjqmL1RMFWPSNmXGh2IFfMI4jaTXgIWiR/ij4kqIwNXXu9tICWs4rBF3DQgC8qi/5Wok7Eb1zVK3ELSJD1hXag/ZNGAh8BDL+PfHxryULeSeYmViDQiyN4Ig8H8BItIZ5+m1I6YAAAAASUVORK5CYII=)',
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
