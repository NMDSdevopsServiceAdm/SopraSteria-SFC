import { Injectable } from '@angular/core';
import * as Highcharts from 'highcharts';
import ArrowSymbolsModule from 'highcharts/modules/arrow-symbols';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

ArrowSymbolsModule(Highcharts);

@Injectable({
  providedIn: 'root',
})
export class GaugeOptionsBuilder {
  private defaultOptions: Highcharts.Options = {
    chart: {
      type: 'bar',
      margin: [0, 0, 0, 0],
      scrollablePlotArea: {
        minWidth: 320,
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
      reversed: true,
      gridLineWidth: 0,
      title: { text: '' },
      startOnTick: false,
      endOnTick: false,
      height: 50,
      labels: {
        padding: 5,
        useHTML: true,
      },
      plotBands: [
        {
          color: {
            linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
            stops: [
              [0, '#CB0101'], // start
              [0.2, '#E35704'], // middle
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
        dataLabels: {
          enabled: true,
          padding: 0,
          useHTML: true,
          formatter: function () {
            return (
              '<span data-testid="currentrank" class="govuk-heading-xl govuk-!-margin-bottom-2">' + this.y + '</span>'
            );
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
          fillColor: '#FFF',
          radius: 35,
          states: {
            hover: {
              enabled: false,
            },
          },
          symbol: 'triangle-left',
        },
      },
    },
  };

  public buildChartOptions(maxRank: number, currentRank: number): Highcharts.Options {
    if (!maxRank && !currentRank) {
      maxRank = 10000000;
    }
    const topMargin = currentRank ? 55 : 0;
    const padding = maxRank / 10;

    return this.build(maxRank, currentRank, padding, topMargin);
  }

  public buildEmptyChartOptions(): Highcharts.Options {
    const maxRank = 10000000;
    const padding = 1000000;

    return this.build(maxRank, null, padding, 0);
  }

  private build(maxRank: number, currentRank: number, padding: number, topMargin: number) {
    const source = {
      chart: {
        margin: [topMargin, 0, 0, 0],
      },
      yAxis: {
        min: 1 - padding,
        max: maxRank + padding,
        tickPositioner: () => {
          return [1, maxRank];
        },
        labels: {
          formatter: this.formatLabel(maxRank),
        },
        plotBands: [
          {
            from: 1 - padding,
            to: maxRank + padding,
          },
        ],
      },
      series: [
        {
          data: [[0, currentRank]],
        },
      ],
      tooltip: {
        enabled: false,
      },
    };
    const options = cloneDeep(this.defaultOptions);

    return merge(options, source);
  }

  private formatLabel(max: number): Highcharts.AxisLabelsFormatterCallbackFunction {
    return function () {
      let value;
      if (max === 10000000) {
        value = '';
      } else {
        value = this.value;
      }
      if (this.value === 1) {
        return (
          '<span data-testid="highest" class="govuk-body govuk-!-margin-bottom-0 govuk-!-margin-right-2">' +
          'Highest ranking ' +
          '<span class="govuk-!-font-weight-bold govuk-!-margin-left-4">' +
          value +
          '</span></span>'
        );
      }
      if (this.value < 0) return;
      return (
        '<span data-testid="lowest" class="govuk-body govuk-!-margin-bottom-0 govuk-!-margin-left-2">' +
        '<span class="govuk-!-font-weight-bold govuk-!-margin-right-4">' +
        value +
        '</span>Lowest ranking</span>'
      );
    };
  }
}
