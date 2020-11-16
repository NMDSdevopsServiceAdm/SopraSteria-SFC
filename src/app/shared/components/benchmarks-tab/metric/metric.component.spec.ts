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
import { BenchmarksMetricComponent } from '@shared/components/benchmarks-tab/metric/metric.component';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

const payTileData = {
  workplaceValue: { value: 1000, hasValue: true },
  comparisonGroup: { value: 1100, hasValue: true },
  goodCqc: { value: 1200, hasValue: true },
  lowTurnover: { value: 900, hasValue: true },
};

const noPayTileData = {
  workplaceValue: { value: null, hasValue: false, stateMessage: 'no-workers' },
  comparisonGroup: { value: null, hasValue: false },
  goodCqc: { value: null, hasValue: false },
  lowTurnover: { value: null, hasValue: false },
};

const getBenchmarksMetricComponent = async (componentProperties = {}) => {
  return render(BenchmarksMetricComponent, {
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
    componentProperties,
  });
};

const setup = (pay) => {
  const establishmentUid = TestBed.inject(EstablishmentService).establishment.uid;
  const metric = 'pay';

  const httpTestingController = TestBed.inject(HttpTestingController);

  const req = httpTestingController.expectOne(`/api/establishment/${establishmentUid}/benchmarks/?tiles=${metric}`);
  req.flush({
    tiles: {
      pay,
    },
  });
};

describe('BenchmarksMetricComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  it('should create a barchart with workplace benchmarks data', async () => {
    const { fixture, getByText } = await getBenchmarksMetricComponent({
      benchmarks: payTileData,
    });

    setup(payTileData);

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
    const { fixture, getByText } = await getBenchmarksMetricComponent({
      benchmarks: noPayTileData,
    });

    setup(noPayTileData);

    fixture.detectChanges();
    await fixture.whenStable();

    const noYourWorkplaceDataMessage = getByText(MetricsContent.Pay.noData['no-workers']);
    const noComparisonGroupsDataMessage = getByText('We do not have enough data to show these comparisons yet.');

    expect(noYourWorkplaceDataMessage).toBeTruthy();
    expect(noComparisonGroupsDataMessage).toBeTruthy();
  });
});
