import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MetricsContent } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FormatUtil } from '@core/utils/format-util';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { BenchmarksRankingsComponent } from '@shared/components/benchmarks-tab/rankings/rankings.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';
import dayjs from 'dayjs';
import { of } from 'rxjs';

const payTileData = {
  workplaceValue: { value: 1000, hasValue: true },
  comparisonGroup: { value: 1100, hasValue: true },
  goodCqc: { value: 1200, hasValue: true },
  lowTurnover: { value: 900, hasValue: true },
};

const turnoverTileData = {
  workplaceValue: { value: 1.1, hasValue: true },
  comparisonGroup: { value: 0.9, hasValue: true },
  goodCqc: { value: 0.8, hasValue: true },
  lowTurnover: { value: 1, hasValue: true },
};

const sicknessTileData = {
  workplaceValue: { value: 8, hasValue: true },
  comparisonGroup: { value: 9, hasValue: true },
  goodCqc: { value: 19, hasValue: true },
  lowTurnover: { value: 1, hasValue: true },
};

const qualificationsTileData = {
  workplaceValue: { value: 1.2, hasValue: true },
  comparisonGroup: { value: 0.1, hasValue: true },
  goodCqc: { value: 0.9, hasValue: true },
  lowTurnover: { value: 1.2, hasValue: true },
};

const metrics: string[] = ['Pay', 'Turnover', 'Sickness', 'Qualifications'];

const getBenchmarksRankingsComponent = async () => {
  return render(BenchmarksRankingsComponent, {
    imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BenchmarksModule],
    providers: [
      {
        provide: EstablishmentService,
        useClass: MockEstablishmentService,
      },
      {
        provide: BenchmarksService,
        useClass: MockBenchmarksService,
      },
      {
        provide: BreadcrumbService,
        useClass: MockBreadcrumbService,
      },
      { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      {
        provide: ActivatedRoute,
        useValue: new MockActivatedRoute({
          fragment: of('pay'),
        }),
      },
    ],
  });
};

describe('BenchmarksRankingsComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  it('should create a page with all 4 titles', async () => {
    const { getAllByText } = await getBenchmarksRankingsComponent();

    metrics.forEach((metric: string) => {
      const content = getAllByText(MetricsContent[metric].title);
      expect(content).toBeTruthy();
    });
  });

  it('should show your comparison group and last updated info', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    fixture.componentInstance.metaDataAvailable = true;
    fixture.componentInstance.lastUpdated = dayjs('2020-11-24').toDate();
    fixture.detectChanges();

    const comparisonGroupText = getByText('Your comparison group');
    const lastUpdated = getByText('data and ranking was last updated 24 November 2020.');

    expect(comparisonGroupText).toBeTruthy();
    expect(lastUpdated).toBeTruthy();
  });

  it('should show your comparison group not available', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    fixture.componentInstance.metaDataAvailable = false;
    fixture.detectChanges();

    const comparisonGroupText = getByText('Your comparison group');
    const notAvailable = getByText('information is not available.');

    expect(comparisonGroupText).toBeTruthy();
    expect(notAvailable).toBeTruthy();
  });

  it('should show your comparison group not available', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    fixture.componentInstance.metaDataAvailable = false;
    fixture.detectChanges();

    const comparisonGroupText = getByText('Your comparison group');
    const notAvailable = getByText('information is not available.');

    expect(comparisonGroupText).toBeTruthy();
    expect(notAvailable).toBeTruthy();
  });

  it('should show description of metric', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    metrics.forEach((metric: string) => {
      const content = getByText(MetricsContent[metric].description);
      expect(content).toBeTruthy();
    });
  });

  it('should show tile info for pay in the title', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    fixture.componentInstance.tilesData.pay = payTileData;
    fixture.detectChanges();

    const content = getByText(`: ${FormatUtil.formatMoney(payTileData.workplaceValue.value)}`);
    expect(content).toBeTruthy();
  });

  it('should show tile info for turnover in the title', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    fixture.componentInstance.tilesData.turnover = turnoverTileData;
    fixture.detectChanges();

    const content = getByText(`: ${FormatUtil.formatPercent(turnoverTileData.workplaceValue.value)}`);
    expect(content).toBeTruthy();
  });

  it('should show tile info for sickness in the title', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    fixture.componentInstance.tilesData.sickness = sicknessTileData;
    fixture.detectChanges();

    const content = getByText(`: ${sicknessTileData.workplaceValue.value} Days`);
    expect(content).toBeTruthy();
  });

  it('should show tile info for qualifications in the title', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    fixture.componentInstance.tilesData.qualifications = qualificationsTileData;
    fixture.detectChanges();

    const content = getByText(`: ${FormatUtil.formatPercent(qualificationsTileData.workplaceValue.value)}`);
    expect(content).toBeTruthy();
  });

  it('should not show tile info for sickness in the title if hasValue is false', async () => {
    const { queryAllByText } = await getBenchmarksRankingsComponent();

    const content = queryAllByText(`Days`);
    expect(content.length).toEqual(0);
  });

  it('should create 4 gauges with workplace rankings data', async () => {
    const { fixture, queryAllByTestId } = await getBenchmarksRankingsComponent();

    fixture.whenStable();

    const lowestRank = queryAllByTestId('lowest');

    lowestRank.forEach((lowestRankElem) => {
      const content = lowestRankElem.textContent;
      const maxRanks = [];

      const rank = parseInt(content.split('Lowest')[0]);

      maxRanks.push(fixture.componentInstance.rankings.pay.maxRank);
      maxRanks.push(fixture.componentInstance.rankings.turnover.maxRank);
      maxRanks.push(fixture.componentInstance.rankings.sickness.maxRank);
      maxRanks.push(fixture.componentInstance.rankings.qualifications.maxRank);

      expect(maxRanks.includes(rank)).toBeTruthy();

      expect(content).toContain('Lowest ranking');
    });

    const highestRank = queryAllByTestId('highest');
    const currentRank = queryAllByTestId('currentrank');

    currentRank.forEach((currentRankElem) => {
      const content = currentRankElem.textContent;
      const currentRanks = [];

      const rank = parseInt(content);

      currentRanks.push(fixture.componentInstance.rankings.pay.currentRank);
      currentRanks.push(fixture.componentInstance.rankings.turnover.currentRank);
      currentRanks.push(fixture.componentInstance.rankings.sickness.currentRank);
      currentRanks.push(fixture.componentInstance.rankings.qualifications.currentRank);

      expect(currentRanks.includes(rank)).toBeTruthy();
    });

    expect(lowestRank.length).toEqual(4);
    expect(highestRank.length).toEqual(4);
    expect(currentRank.length).toEqual(4);
  });

  describe('calculateJourneyType', () => {
    it('should calculate the correct journey type when the workplace is the primary workplace', async () => {
      const { fixture } = await getBenchmarksRankingsComponent();

      fixture.componentInstance.establishmentUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.calculateJourneyType();
      fixture.detectChanges();

      expect(fixture.componentInstance.journeyType).toEqual('dashboard');
    });

    it('should calculate the correct journey type when the workplace is a subsidiary', async () => {
      const { fixture } = await getBenchmarksRankingsComponent();

      fixture.componentInstance.establishmentUid = '1234';
      fixture.componentInstance.primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.calculateJourneyType();
      fixture.detectChanges();

      expect(fixture.componentInstance.journeyType).toEqual('workplace');
    });
  });
});
