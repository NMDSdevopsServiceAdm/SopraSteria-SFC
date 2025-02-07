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
      height: 105,
      type: 'bar',
      margin: [0, 0, 0, 0],
      scrollablePlotArea: {
        minWidth: 320,
      },
      backgroundColor: null,
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
      height: 26,
      labels: {
        padding: 5,
        useHTML: true,
      },
      plotBands: [
        {
          color: {
            linearGradient: { x1: 1, y1: 0, x2: 0, y2: 0 },
            stops: [
              [0, '#019F44'], // start
              [0.34, '#E8A103'], // middle
              [0.88, '#E8A103'], // middle
              [1, '#CE0000'], // end
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
          padding: 10,
          useHTML: true,
          formatter: function () {
            return (
              '<span data-testid="currentrank" class="govuk-body govuk-!-font-size-27 govuk-!-font-weight-bold govuk-!-margin-bottom-5">' +
              this.y +
              '</span>'
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
          fillColor: '#F3F2F1',
          radius: 17,
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

    const topMargin = currentRank ? 35 : 15;
    const padding =
      maxRank >= 200
        ? maxRank / 50
        : maxRank > 100
        ? maxRank / 90
        : maxRank >= 20
        ? maxRank / 50
        : maxRank >= 10
        ? maxRank / 50
        : maxRank >= 4
        ? maxRank / 55
        : maxRank > 2
        ? maxRank / 58
        : maxRank > 2
        ? maxRank / 58
        : maxRank / 85;
    return this.build(maxRank, currentRank, padding, topMargin);
  }

  public buildEmptyChartOptions(): Highcharts.Options {
    const maxRank = 10000000;
    const padding = 1000000;

    return this.build(maxRank, null, padding, 0);
  }

  public rankLabelOffset(currentRank: number, maxRank: number) {
    if (currentRank === 1) {
      return -2;
    } else if (currentRank === maxRank && currentRank >= 100) {
      return 10;
    } else if (currentRank === maxRank && currentRank > 20) {
      return 5;
    } else if (currentRank === maxRank) {
      return 2;
    }
  }

  private build(maxRank: number, currentRank: number, padding: number, topMargin: number) {
    const source = {
      chart: {
        margin: [topMargin, 0, 0, 0],
        height: currentRank ? 105 : 85,
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
          dataLabels: {
            x: this.rankLabelOffset(currentRank, maxRank),
          },
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
      if (Number(this.value) === 1) {
        return (
          '<span data-testid="highest" class="govuk-body govuk-!-margin-bottom-0">' +
          '<span class="govuk-!-font-weight-bold">' +
          value +
          '</span></span>'
        );
      }
      if (Number(this.value) < 0) return;
      return (
        '<span data-testid="lowest" class="govuk-body govuk-!-margin-bottom-0">' +
        '<span class="govuk-!-font-weight-bold">' +
        value +
        '</span>'
      );
    };
  }
}
