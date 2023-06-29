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
        //formatter: this.formatLabel(type),
      },
    },
    xAxis: {
      type: 'category',
      title: {
        margin: 15,
        y: 0,
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
        useHTML: true,
        label: {
          text: `<span class="govuk-body govuk-!-font-size-16 govuk-!-font-weight-bold">You,</span><br/><span class="govuk-body govuk-!-font-size-16 govuk-!-font-weight-bold"> ${this.formatLineLabel(
            type,
            value,
          )} </span>`,
          align: 'center',
          x: 246,
          y: 0,
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
          data: null,
          opacity: 100,
        },
      ],
      yAxis: {
        title: {
          text: null,
        },
        labels: {
          useHTML: true,
          formatter: this.formatLabel(type),
        },
        //formatter: this.formatLabel(type),
        plotLines: plotlines,
      },
    };
    if (rankingData.allValues?.length == 0) {
      source.series[0].data = [{ y: 20000 }];
      source.series[0].opacity = 0;
    } else {
      source.series[0].data = this.buildChartData(rankingData, type);
    }

    const options = cloneDeep(this.defaultOptions);
    options.title = {
      y: 30,
      x: -10,
      align: 'left',
      text: `<span class="govuk-!-font-size-16 govuk-!-font-weight-bold" style='font-family:"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif'>${this.getYAxisTitle(
        type,
      )}</span>`,
    };

    return merge(options, source);
  }

  private getXAxisTitle(): string {
    return '<span class="govuk-body govuk-!-font-size-16 govuk-!-font-weight-bold">Workplaces</span>';
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

  private formatLabel(type: Metric): Highcharts.AxisLabelsFormatterCallbackFunction {
    return function () {
      //return '<span class="govuk-body">£' + this.value + '</span>';
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
