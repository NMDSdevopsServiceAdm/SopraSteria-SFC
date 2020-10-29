import { Injectable } from '@angular/core';
import { BenchmarkValue, Metric, Tile } from '@core/model/benchmarks.model';
import { FormatUtil } from '@core/utils/fomat-util';
import { merge } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class BarchartOptionsBuilder {
  private defaultOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      margin: [30, 0, 100, 0],
      scrollablePlotArea: {
        minWidth: 960,
      },
    },
    series: [
      {
        accessibility: {
          enabled: true,
        },
        type: 'column',
        color: '#6F72AF',
        dataLabels: {
          enabled: true,
          align: 'left',
          padding: 0,
          useHTML: true,
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
        align: 'left',
        x: -100,
        useHTML: true,
        style: {
          width: 200,
        },
        formatter: this.formatLabel(),
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
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },
  };

  public buildChartOptions(benchmarks: Tile, type: Metric, noData: string, altDescription: string): Highcharts.Options {
    const source = {
      chart: {
        events: {
          load: this.addEmptyStates(noData),
        },
      },
      series: [
        {
          accessibility: {
            description: altDescription,
          },
          data: this.buildChartData(benchmarks),
          dataLabels: {
            formatter: this.formatDataLabels(type),
          },
        },
      ],
    };

    return merge(this.defaultOptions, source);
  }

  public buildEmptyChartOptions(altDescription: string): Highcharts.Options {
    const source = {
      series: [
        {
          accessibility: {
            description: altDescription,
          },
          data: this.buildChartData(null),
        },
      ],
    };

    return merge(this.defaultOptions, source);
  }

  private formatLabel(): Highcharts.AxisLabelsFormatterCallbackFunction {
    return function () {
      const bold = this.isFirst ? 'govuk-!-font-weight-bold' : 'govuk-!-font-weight-regular';
      return '<span class="govuk-body ' + bold + '">' + this.value + '</span>';
    };
  }

  private formatDataLabels(type: Metric): Highcharts.DataLabelsFormatterCallbackFunction {
    return function () {
      let value;
      switch (type) {
        case Metric.pay:
          value = FormatUtil.formatMoney(this.y);
          break;
        case Metric.sickness:
          value = this.y + ' days';
          break;
        default:
          value = FormatUtil.formatPercent(this.y);
      }
      const size = this.key === 'Your workplace' ? 'govuk-heading-xl' : 'govuk-heading-m';
      return '<span class="' + size + ' govuk-!-margin-bottom-2">' + value + '</span>';
    };
  }

  private addEmptyStates(noData: string): Highcharts.ChartLoadCallbackFunction {
    return function () {
      const categoryWidth = this.plotWidth / this.xAxis[0].series[0].data.length;
      let width = categoryWidth - 40;

      this.series[0].points.forEach((point, index) => {
        if (point.y === null && (index === 0 || index === 1 || this.series[0].points[index - 1]?.y !== null)) {
          let message;
          if (point.name !== 'Your workplace') {
            message = 'We do not have enough data to show this comparison yet.';
            if (this.series[0].points[index + 1]?.y === null && this.series[0].points[index + 2]?.y === null) {
              width = categoryWidth * 3 - 40;
              message = 'We do not have enough data to show these comparisons yet.';
            } else if (this.series[0].points[index + 1]?.y === null) {
              width = categoryWidth * 2 - 40;
              message = 'We do not have enough data to show these comparisons yet.';
            }
          } else {
            message = noData;
          }

          const offset = point.x * categoryWidth + width / 2 + 20;
          const text = this.renderer
            .text('<span class="govuk-body no-data">' + message + '</span>', -999, -999, true)
            .css({
              width,
            })
            .add();
          text.attr({
            x: this.plotLeft + offset - text.getBBox().width / 2,
            y: this.plotTop + (this.plotHeight / 3) * 2,
          });
        }
      });
    };
  }

  private buildChartData(benchmarks: Tile): any[] {
    const get = (bv: BenchmarkValue) => {
      return bv && bv.hasValue ? bv.value : null;
    };

    return [
      { y: get(benchmarks?.workplaceValue), color: '#28a197', name: 'Your workplace' },
      { y: get(benchmarks?.comparisonGroup), name: 'Comparison group' },
      { y: get(benchmarks?.goodCqc), name: 'Good and outstanding CQC providers in your comparison group' },
      { y: get(benchmarks?.lowTurnover), name: 'Workplaces with a low turnover rate in your comparison group' },
    ];
  }
}
