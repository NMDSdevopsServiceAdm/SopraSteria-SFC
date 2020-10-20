import { Component, Directive, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Directive({
  selector: 'your-rank',
})
export class YourRankDirective {}
@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
})
export class GaugeComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  @Input('maxRank') private maxRank: number = -2;
  @Input('currentRank') public currentRank: number = null;

  public gauge: Highcharts.Options;

  ngOnInit() {
    const padding = this.maxRank / 10;
    this.gauge = {
      chart: {
        type: 'bar',
        margin: [55, 0, 0, 0],
        scrollablePlotArea: {
          minWidth: 700,
        },
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
        min: 1 - padding,
        max: this.maxRank + padding,
        reversed: true,
        gridLineWidth: 0,
        title: { text: '' },
        startOnTick: false,
        endOnTick: false,
        tickPositioner: () => {
          return [1, this.maxRank];
        },
        height: 50,
        labels: {
          padding: 5,
          useHTML: true,
          formatter: function () {
            if (this.value === 1) {
              return (
                '<span class="govuk-body govuk-!-margin-bottom-0">Highest ranking <span class="govuk-!-font-weight-bold govuk-!-margin-left-4">' +
                this.value +
                '</span></span>'
              );
            }
            if (this.value < 0) return;
            return (
              '<span class="govuk-body govuk-!-margin-bottom-0"><span class="govuk-!-font-weight-bold govuk-!-margin-right-4">' +
              this.value +
              '</span>Lowest ranking</span>'
            );
          },
        },
        plotBands: [
          {
            from: 1 - padding,
            to: this.maxRank + padding,
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
          data: [[0, this.currentRank]],
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
  }
}
