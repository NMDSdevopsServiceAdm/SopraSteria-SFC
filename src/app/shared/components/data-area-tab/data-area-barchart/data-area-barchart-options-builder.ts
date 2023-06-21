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
        // rotation: 0,
      },
      gridLineColor: '#d4d5d5',
      labels: {
        useHTML: true,
        formatter: this.formatLabel(),
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
      column: {
        maxPointWidth: 100,
      },
      series: {
        dataLabels: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },
  };

  public buildChartOptions(
    title: string,
    rankingData: RankingsResponse,
    type: Metric,
    altDescription: string,
  ): Highcharts.Options {
    const plotlines = [];
    const currentEstablishmentValue = rankingData.allValues?.find((obj) => {
      return obj.currentEst === true;
    })?.value;
    if (currentEstablishmentValue) {
      const value =
        type === Metric.careWorkerPay || type === Metric.seniorCareWorkerPay
          ? currentEstablishmentValue / 100
          : currentEstablishmentValue;
      plotlines.push({
        color: 'black',
        width: 2,
        value: value,
        zIndex: 5,
        label: {
          text: `<span class="govuk-body govuk-!-font-size-16 govuk-!-font-weight-bold">You, ${this.formatLineLabel(
            type,
            value,
          )}</span>`,
          align: 'right',
          x: 100,
          y: 5,
        },
      });
    }
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
          data: this.buildChartData(rankingData, type),
        },
      ],
      yAxis: {
        title: {
          text: null,
        },
        formatter: this.formatLabel(),
        plotLines: plotlines,
      },
    };

    const options = cloneDeep(this.defaultOptions);
    options.title = {
      y: 30,
      x: 0,
      align: 'left',
      text: `<span class="govuk-!-font-size-16 govuk-!-font-weight-bold" style='font-family:"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif'>${this.getYAxisTitle(
        type,
      )}</span>`,
    };

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

  private formatLabel(): Highcharts.AxisLabelsFormatterCallbackFunction {
    return function () {
      return '<span class="govuk-body">£' + this.value + '</span>';
    };
  }

  private formatLineLabel(type: Metric, labelValue: number): string {
    let value;
    switch (type) {
      case Metric.pay:
      case Metric.careWorkerPay:
      case Metric.seniorCareWorkerPay:
        value = '£' + labelValue.toFixed(2);
        break;
      case Metric.registeredManagerPay:
      case Metric.registeredNursePay:
        value = FormatUtil.formatSalary(labelValue);
        break;
      case Metric.sickness:
        value = labelValue + ' days';
        break;
      default:
        value = FormatUtil.formatPercent(labelValue);
    }
    return value;
  }

  // private formatDataLabels(type: Metric): Highcharts.DataLabelsFormatterCallbackFunction {
  //   return function () {
  //     let value;
  //     switch (type) {
  //       case Metric.pay:
  //       case Metric.careWorkerPay:
  //       case Metric.seniorCareWorkerPay:
  //         value = '£' + this.y.toFixed(2);
  //         break;
  //       case Metric.registeredManagerPay:
  //       case Metric.registeredNursePay:
  //         value = FormatUtil.formatSalary(this.y);
  //         break;
  //       case Metric.sickness:
  //         value = this.y + ' days';
  //         break;
  //       default:
  //         value = FormatUtil.formatPercent(this.y);
  //     }
  //     const size = this.key === 'Your workplace' ? 'govuk-heading-xl' : 'govuk-body-s';
  //     return '<span class="' + size + '">' + value + '</span>';
  //   };
  // }

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

  private buildChartData(rankingData: RankingsResponse, type: Metric): any[] {
    return rankingData.allValues
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
