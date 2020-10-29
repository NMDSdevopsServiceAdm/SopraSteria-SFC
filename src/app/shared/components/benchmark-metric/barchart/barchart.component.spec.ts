import { Metric, Tile } from '@core/model/benchmarks.model';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { HighchartsChartModule } from 'highcharts-angular';

import { BarchartComponent } from './barchart.component';

import { build, fake } from '@jackfranklin/test-data-bot';
import { BarchartOptionsBuilder } from './barchart-options-builder';
import { FormatUtil } from '@core/utils/fomat-util';

const benchmarksBuilder = build<Tile>('Benchmarks', {
  fields: {
    workplaceValue: { value: fake((f) => f.random.number(100)), hasValue: true },
    comparisonGroup: { value: fake((f) => f.random.number(100)), hasValue: true },
    goodCqc: { value: fake((f) => f.random.number(100)), hasValue: true },
    lowTurnover: { value: fake((f) => f.random.number(100)), hasValue: true },
  },
});

const getBarchartComponent = async (type: Metric, benchmarks: Tile) => {
  return render(BarchartComponent, {
    imports: [HighchartsChartModule, SharedModule],
    providers: [BarchartOptionsBuilder],
    componentProperties: {
      type,
      altDescription: '',
      noData: 'nopay',
      benchmarks,
    },
  });
};

describe('BarchartComponent', () => {
  it('should display a bar for each column', async () => {
    const benchmarks = benchmarksBuilder();

    const { container } = await getBarchartComponent(Metric.pay, benchmarks);

    const columns = container.getElementsByClassName('highcharts-point');

    expect(columns.length).toBe(4);
  });

  it('should not display a bar for a column when no data is available', async () => {
    const { container } = await getBarchartComponent(Metric.pay, null);

    const columns = container.getElementsByClassName('highcharts-point');

    expect(columns.length).toBe(0);
  });

  it('should display a message when data is not available', async () => {
    const benchmarks = benchmarksBuilder();
    benchmarks.lowTurnover = null;

    const { getByText } = await getBarchartComponent(Metric.pay, benchmarks);

    const message = getByText('We do not have enough data to show this comparison yet.');

    expect(message).toBeTruthy();
  });

  it('should display a message across adjacent columns when data is not available', async () => {
    const benchmarks = benchmarksBuilder();
    benchmarks.goodCqc = null;
    benchmarks.lowTurnover = null;

    const { getByText } = await getBarchartComponent(Metric.pay, benchmarks);

    const message = getByText('We do not have enough data to show these comparisons yet.');

    expect(message).toBeTruthy();
  });

  describe('pay', () => {
    it('should display correct data labels for pay', async () => {
      const benchmarks = benchmarksBuilder();

      const { getByText } = await getBarchartComponent(Metric.pay, benchmarks);

      for (let key in benchmarks) {
        expect(getByPayText(benchmarks[key].value)).toBeTruthy();
      }

      function getByPayText(data: any) {
        return getByText(FormatUtil.formatMoney(data));
      }
    });
  });

  describe('turnover', () => {
    it('should display correct data labels for turnover', async () => {
      const benchmarks = benchmarksBuilder();

      const { getByText } = await getBarchartComponent(Metric.turnover, benchmarks);

      for (let key in benchmarks) {
        expect(getByTurnoverText(benchmarks[key].value)).toBeTruthy();
      }

      function getByTurnoverText(data: any) {
        return getByText(FormatUtil.formatPercent(data));
      }
    });
  });

  describe('qualification', () => {
    it('should display correct data labels for qualification', async () => {
      const benchmarks = benchmarksBuilder();

      const { getByText } = await getBarchartComponent(Metric.qualifications, benchmarks);

      for (let key in benchmarks) {
        expect(getByQualificationText(benchmarks[key].value)).toBeTruthy();
      }

      function getByQualificationText(data: any) {
        return getByText(FormatUtil.formatPercent(data));
      }
    });
  });

  describe('sickness', () => {
    it('should display correct data labels for sickness', async () => {
      const benchmarks = benchmarksBuilder();

      const { getByText } = await getBarchartComponent(Metric.sickness, benchmarks);

      for (let key in benchmarks) {
        expect(getBySicknessText(benchmarks[key].value)).toBeTruthy();
      }

      function getBySicknessText(data: any) {
        return getByText(data + ' days');
      }
    });
  });
});
