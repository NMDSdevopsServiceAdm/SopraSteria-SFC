import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MetricsContent } from '@core/model/benchmarks.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { BenchmarksMetricComponent } from '@shared/components/benchmarks-tab/metric/metric.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

const payTileData = {
  workplaceValue: { value: 1000, hasValue: true },
  comparisonGroup: { value: 1100, hasValue: true },
  goodCqc: { value: 1200, hasValue: true },
  lowTurnover: { value: 900, hasValue: true },
};

const noPayTileData = {
  workplaceValue: { value: null, hasValue: false, stateMessage: 'no-pay-data' },
  comparisonGroup: { value: null, hasValue: false },
  goodCqc: { value: null, hasValue: false },
  lowTurnover: { value: null, hasValue: false },
};

const payRankingData = {
  currentRank: 2,
  maxRank: 3,
  hasValue: true,
};

const noPayRankingData = {
  hasValue: false,
  stateMessage: 'no-data',
};

const getBenchmarksMetricComponent = async () => {
  return render(BenchmarksMetricComponent, {
    imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BenchmarksModule],
    providers: [
      {
        provide: EstablishmentService,
        useClass: MockEstablishmentService,
      },
      { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      {
        provide: BreadcrumbService,
        useClass: MockBreadcrumbService,
      },
      {
        provide: ActivatedRoute,
        useValue: new MockActivatedRoute({
          data: of({
            ...MetricsContent.Pay,
          }),
        }),
      },
    ],
  });
};

const setup = (payTile, payRanking) => {
  const establishmentUid = TestBed.inject(EstablishmentService).establishment.uid;
  const metric = 'pay';

  const httpTestingController = TestBed.inject(HttpTestingController);

  const req = httpTestingController.expectOne(`/api/establishment/${establishmentUid}/benchmarks/?tiles=${metric}`);
  req.flush({
    pay: payTile,
  });

  const req2 = httpTestingController.expectOne(`/api/establishment/${establishmentUid}/benchmarks/rankings/${metric}`);
  req2.flush(payRanking);
};

describe('BenchmarksMetricComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  it('should create a barchart with workplace benchmarks data', async () => {
    const { fixture, getByText } = await getBenchmarksMetricComponent();

    setup(payTileData, noPayRankingData);

    fixture.detectChanges();

    const yourWorkplace = getByText('£10.00');
    const comparisonGroup = getByText('£11.00');
    const goodCqc = getByText('£12.00');
    const lowTurnover = getByText('£9.00');

    expect(yourWorkplace).toBeTruthy();
    expect(comparisonGroup).toBeTruthy();
    expect(goodCqc).toBeTruthy();
    expect(lowTurnover).toBeTruthy();
  });

  it('should create a barchart messages when no benchmarks data available', async () => {
    const { fixture, getByText } = await getBenchmarksMetricComponent();

    setup(noPayTileData, noPayRankingData);

    fixture.detectChanges();
    await fixture.whenStable();

    const noYourWorkplaceDataMessage = getByText(MetricsContent.Pay.noData['no-pay-data']);
    const noComparisonGroupsDataMessage = getByText('We do not have enough data to show these comparisons yet.');

    expect(noYourWorkplaceDataMessage).toBeTruthy();
    expect(noComparisonGroupsDataMessage).toBeTruthy();
  });

  it('should create a gauges with workplace rankings data', async () => {
    const { fixture, queryAllByTestId } = await getBenchmarksMetricComponent();

    setup(noPayTileData, payRankingData);

    fixture.detectChanges();

    fixture.whenStable();

    const lowestRank = queryAllByTestId('lowest');

    lowestRank.forEach((lowestRankElem) => {
      const content = lowestRankElem.textContent;

      const rank = parseInt(content.split('Lowest')[0]);

      expect(payRankingData.maxRank === rank).toBeTruthy();

      expect(content).toContain('Lowest ranking');
    });

    const highestRank = queryAllByTestId('highest');
    const currentRank = queryAllByTestId('currentrank');

    currentRank.forEach((currentRankElem) => {
      const content = currentRankElem.textContent;

      const rank = parseInt(content);

      expect(payRankingData.currentRank === rank).toBeTruthy();
    });

    expect(lowestRank.length).toEqual(1);
    expect(highestRank.length).toEqual(1);
    expect(currentRank.length).toEqual(1);
  });

  describe('calculateJourneyType', () => {
    it('should calculate the correct journey type when the workplace is the primary workplace', async () => {
      const { fixture } = await getBenchmarksMetricComponent();
      setup(noPayTileData, payRankingData);

      fixture.componentInstance.establishmentUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.calculateJourneyType();
      fixture.detectChanges();

      expect(fixture.componentInstance.journeyType).toEqual('dashboard');
    });

    it('should calculate the correct journey type when the workplace is a subsidiary', async () => {
      const { fixture } = await getBenchmarksMetricComponent();
      setup(noPayTileData, payRankingData);

      fixture.componentInstance.establishmentUid = '1234';
      fixture.componentInstance.primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.calculateJourneyType();
      fixture.detectChanges();

      expect(fixture.componentInstance.journeyType).toEqual('workplace');
    });
  });
});
