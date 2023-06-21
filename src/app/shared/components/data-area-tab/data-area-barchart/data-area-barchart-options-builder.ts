import { Injectable } from '@angular/core';
import { Metric, RankingsResponse } from '@core/model/benchmarks.model';
import { FormatUtil } from '@core/utils/format-util';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

@Injectable({
  providedIn: 'root',
})
export class DataAreaBarchartOptionsBuilder {
  private defaultOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      marginTop: 75,
      marginRight: 100,
      backgroundColor: '#f3f2f1',
      plotBorderColor: '#d4d5d5',
      plotBorderWidth: 1,
    },
    series: [
      {
        accessibility: {
          enabled: true,
        },
        // dataLabels: {
        //   enabled: true,
        //   align: 'left',
        //   padding: 0,
        //   useHTML: true,
        //   crop: false,
        //   overflow: 'allow',
        // },
        type: 'column',
        showInLegend: false,
        groupPadding: 0,
        pointPadding: 0.03,
      },
    ],

    yAxis: {
      visible: true,
      min: 0,
      title: {
        useHTML: true,
        rotation: 0,
        align: 'high',
        offset: 0,
        y: -50,
        x: 40,
      },
      gridLineColor: '#d4d5d5',
      labels: {
        useHTML: true,
        // formatter: this.formatLabel(),
      },
    },
    xAxis: {
      type: 'category',
      title: {
        text: this.getXAxisTitle(),
        useHTML: true,
      },
      labels: {
        enabled: false,
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

  public buildChartOptions(rankingsData: RankingsResponse, type: Metric, altDescription: string): Highcharts.Options {
    const noData = '';
    // console.log('***** BUILD CHART OPTIONS *****');
    // console.log(rankingsData);
    // console.log(type);
    const source = {
      chart: {
        // events: {
        //   load: this.addEmptyStates(noData),
        // },
      },
      series: [
        {
          accessibility: {
            description: altDescription,
          },
          data: this.buildChartData(rankingsData, type),
          // dataLabels: {
          //   formatter: this.formatDataLabels(type),
          // },
        },
      ],
      yAxis: {
        title: {
          text: this.getYAxisTitle(type),
        },
        labels: {
          useHTML: true,
          formatter: this.formatLabel(type),
        },
      },
    };

    const options = cloneDeep(this.defaultOptions);
    return merge(options, source);
  }

  private getXAxisTitle(): string {
    return '<span class="govuk-body govuk-!-font-size-19 govuk-!-font-weight-bold">Workplaces</span>';
  }

  private getYAxisTitle(type: Metric): string {
    let axisTitle;
    switch (type) {
      case Metric.careWorkerPay:
      case Metric.seniorCareWorkerPay:
        axisTitle = 'Hourly pay';
        break;
      case Metric.registeredManagerPay:
      case Metric.registeredNursePay:
        axisTitle = 'Annual salary';
        break;
      case Metric.vacancy:
        axisTitle = 'Vacancy rate';
        break;
      case Metric.turnover:
        axisTitle = 'Turnover rate';
        break;
      case Metric.timeInRole:
        axisTitle = 'Percentage of staff';
        break;
    }
    return '<span class="govuk-body govuk-!-font-size-19 govuk-!-font-weight-bold">' + axisTitle + '</span>';
  }

  // public buildEmptyChartOptions(altDescription: string): Highcharts.Options {
  //   const source = {
  //     series: [
  //       {
  //         accessibility: {
  //           description: altDescription,
  //         },
  //         data: this.buildChartData(null),
  //       },
  //     ],
  //   };

  //   return merge(this.defaultOptions, source);
  // }

  private formatLabel(type: Metric): Highcharts.AxisLabelsFormatterCallbackFunction {
    return function () {
      switch (type) {
        case Metric.pay:
        case Metric.careWorkerPay:
        case Metric.seniorCareWorkerPay:
        case Metric.registeredManagerPay:
        case Metric.registeredNursePay:
          return '<span class="govuk-body">£' + this.value + '</span>';
        case Metric.vacancy:
        case Metric.turnover:
        case Metric.timeInRole:
          return '<span class="govuk-body">' + FormatUtil.formatPercent(this.value) + '</span>';
      }
    };
  }

  private formatDataLabels(type: Metric): Highcharts.DataLabelsFormatterCallbackFunction {
    return function () {
      console.log('***** here *****');
      console.log(this.y);
      let value;
      switch (type) {
        // case (Metric.pay,
        // Metric.careWorkerPay,
        // Metric.seniorCareWorkerPay,
        // Metric.registeredManagerPay,
        // Metric.registeredNursePay):
        case Metric.pay:
        case Metric.careWorkerPay:
        case Metric.seniorCareWorkerPay:
        case Metric.registeredManagerPay:
        case Metric.registeredNursePay:
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

  // private addEmptyStates(noData: string): Highcharts.ChartLoadCallbackFunction {
  //   return function () {
  //     const categoryWidth = this.plotWidth / this.xAxis[0].series[0].data.length;
  //     let width = categoryWidth - 30;

  //     this.series[0].points.forEach((point, index) => {
  //       if (point.y === null && (index === 0 || index === 1 || this.series[0].points[index - 1]?.y !== null)) {
  //         let message;
  //         if (point.name !== 'Your workplace') {
  //           message = 'We do not have enough data to show this comparison yet.';
  //           if (this.series[0].points[index + 1]?.y === null && this.series[0].points[index + 2]?.y === null) {
  //             width = categoryWidth * 3 - 40;
  //             message = 'We do not have enough data to show these comparisons yet.';
  //           } else if (this.series[0].points[index + 1]?.y === null) {
  //             width = categoryWidth * 2 - 40;
  //             message = 'We do not have enough data to show these comparisons yet.';
  //           }
  //         } else {
  //           message = noData;
  //         }

  //         const offset = point.x * categoryWidth + width / 2 + 10;
  //         const text = this.renderer
  //           .text('<span class="govuk-body no-data">' + message + '</span>', -999, -999, true)
  //           .css({
  //             width,
  //           })
  //           .add();
  //         text.attr({
  //           x: this.plotLeft + offset - text.getBBox().width / 2,
  //           y: this.plotTop + (this.plotHeight / 3) * 2,
  //         });
  //       }
  //     });
  //   };
  // }

  private buildChartData(rankingsData: RankingsResponse, type: Metric): any[] {
    return rankingsData.allValues
      ?.map((workplace) => {
        const value =
          type === Metric.careWorkerPay || type === Metric.seniorCareWorkerPay
            ? workplace.value / 100
            : workplace.value;
        return { y: value, color: workplace.currentEst ? '#28a197' : '#6F72AF' };
      })
      .reverse();
  }
}
