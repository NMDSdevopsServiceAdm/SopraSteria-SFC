import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

export enum Metric {
  'pay',
  'turnover',
  'qualification',
  'sickness',
}

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss'],
})
export class BarchartComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  @Input('yourworkplace') private yourworkplace: number = null;
  @Input('comparisongroup') private comparisongroup: number = null;
  @Input('goodcqc') private goodcqc: number = null;
  @Input('lowturnover') private lowturnover: number = null;
  @Input('altdescription') private altdescription: string = '';
  @Input('type') private type: Metric;

  public barchart: Highcharts.Options;

  ngOnInit() {
    const type = this.type;
    const formatPay = (data) => {
      return '£' + (Number(data) / 100).toFixed(2);
    };
    this.barchart = {
      chart: {
        type: 'column',
        margin: [20, 0, 85, 0],
        scrollablePlotArea: {
          minWidth: 700,
        },
      },
      series: [
        {
          accessibility: {
            description: this.altdescription,
            enabled: true,
          },
          data: [
            { y: this.yourworkplace, color: '#28a197', name: 'Your workplace' },
            { y: this.comparisongroup, name: 'Comparison group' },
            { y: this.goodcqc, name: 'Good and outstanding CQC providers in your comparison group' },
            { y: this.lowturnover, name: 'Workplaces with a low turnover rate in your comparison group' },
          ],
          type: 'column',
          color: '#6F72AF',
          dataLabels: {
            enabled: true,
            align: 'left',
            padding: 0,
            useHTML: true,
            formatter: function () {
              let value;
              switch (type) {
                case Metric.pay:
                  value = formatPay(this.y);
                  break;
                case Metric.sickness:
                  value = this.y + ' days';
                  break;
                default:
                  value = this.y + '%';
              }
              const size = this.key === 'Your workplace' ? 'govuk-heading-xl' : 'govuk-heading-m';
              return '<span class="' + size + ' govuk-!-margin-bottom-2">' + value + '</span>';
            },
            nullFormatter: function () {
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
  }
}
