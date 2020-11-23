import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MetricsContent } from '@core/model/benchmarks.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { BenchmarksRankingsComponent } from '@shared/components/benchmarks-tab/rankings/rankings.component';
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

const getBenchmarksRankingsComponent = async () => {
  return render(BenchmarksRankingsComponent, {
    imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BenchmarksModule],
    providers: [
      {
        provide: EstablishmentService,
        useClass: MockEstablishmentService,
      },
      {
        provide: BreadcrumbService,
        useClass: MockBreadcrumbService,
      },
      {
        provide: ActivatedRoute,
        useValue: {
          data: of({
            ...MetricsContent.Pay,
          }),
        },
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

  fit('should create a page with all 4 ranking components', async () => {
    const { fixture, getByText, getAllByText } = await getBenchmarksRankingsComponent();

    const pay = getAllByText('Pay');
    const sickness = getAllByText('Sickness');
    const turnover = getAllByText('Turnover');
    const qualifications = getAllByText('Qualifications');

    expect(pay).toBeTruthy();
    expect(sickness).toBeTruthy();
    expect(turnover).toBeTruthy();
    expect(qualifications).toBeTruthy();
  });
});
