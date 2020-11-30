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
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { BenchmarksRankingsComponent } from '@shared/components/benchmarks-tab/rankings/rankings.component';
import { render } from '@testing-library/angular';
import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';

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
      {
        provide: ActivatedRoute,
        useValue: new MockActivatedRoute({
          fragment: Observable.from('pay'),
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

describe('BenchmarksRankingsComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  it('should create a page with all 4 titles', async () => {
    const { fixture, getAllByText } = await getBenchmarksRankingsComponent();

    metrics.forEach((metric: string) => {
      const content = getAllByText(MetricsContent[metric].title);
      expect(content).toBeTruthy();
    });
  });

  it('should show your comparison group and last updated info', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    fixture.componentInstance.metaDataAvailable = true;
    fixture.componentInstance.lastUpdated = moment('2020-11-24').toDate();
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
  it('should show tile info in the title', async () => {
    const { fixture, getByText } = await getBenchmarksRankingsComponent();

    metrics.forEach((metric: string) => {
      const content = getByText(MetricsContent[metric].description);
      expect(content).toBeTruthy();
    });
  });
});
