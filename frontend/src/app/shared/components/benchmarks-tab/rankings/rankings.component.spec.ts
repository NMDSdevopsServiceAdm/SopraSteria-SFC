import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MetricsContent } from '@core/model/benchmarks.model';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBenchmarksService, oldBenchmarksData } from '@core/test-utils/MockBenchmarkService';
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

const { pay, turnover, qualifications, sickness } = oldBenchmarksData;

const metrics: string[] = ['Pay', 'Turnover', 'Sickness', 'Qualifications'];

describe('BenchmarksRankingsComponent', () => {
  const setup = async () => {
    const setupTools = await render(BenchmarksRankingsComponent, {
      imports: [HttpClientTestingModule, BrowserModule, BenchmarksModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BenchmarksV2Service,
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

    const component = setupTools.fixture.componentInstance;
    return {
      ...setupTools,
      component,
    };
  };

  it('should create a page with all 4 titles', async () => {
    const { getAllByText } = await setup();

    metrics.forEach((metric: string) => {
      const content = getAllByText(MetricsContent[metric].title);
      expect(content).toBeTruthy();
    });
  });

  it('should show your comparison group and last updated info', async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.metaDataAvailable = true;
    fixture.componentInstance.lastUpdated = dayjs('2020-11-24').toDate();
    fixture.detectChanges();

    const comparisonGroupText = getByText('Your comparison group');
    const lastUpdated = getByText('data and ranking was last updated 24 November 2020.');

    expect(comparisonGroupText).toBeTruthy();
    expect(lastUpdated).toBeTruthy();
  });

  it('should show your comparison group not available', async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.metaDataAvailable = false;
    fixture.detectChanges();

    const comparisonGroupText = getByText('Your comparison group');
    const notAvailable = getByText('information is not available.');

    expect(comparisonGroupText).toBeTruthy();
    expect(notAvailable).toBeTruthy();
  });

  it('should show your comparison group not available', async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.metaDataAvailable = false;
    fixture.detectChanges();

    const comparisonGroupText = getByText('Your comparison group');
    const notAvailable = getByText('information is not available.');

    expect(comparisonGroupText).toBeTruthy();
    expect(notAvailable).toBeTruthy();
  });

  it('should show description of metric', async () => {
    const { getByText } = await setup();

    metrics.forEach((metric: string) => {
      const content = getByText(MetricsContent[metric].description);
      expect(content).toBeTruthy();
    });
  });

  it('should show tile info for pay in the title', async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.tilesData.pay = pay;
    fixture.detectChanges();

    const content = getByText(`: ${FormatUtil.formatMoney(pay.workplaceValue.value)}`);
    expect(content).toBeTruthy();
  });

  it('should show tile info for turnover in the title', async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.tilesData.turnover = turnover;
    fixture.detectChanges();

    const content = getByText(`: ${FormatUtil.formatPercent(turnover.workplaceValue.value)}`);
    expect(content).toBeTruthy();
  });

  it('should show tile info for sickness in the title', async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.tilesData.sickness = sickness;
    fixture.detectChanges();

    const content = getByText(`: ${sickness.workplaceValue.value} Days`);
    expect(content).toBeTruthy();
  });

  it('should show tile info for qualifications in the title', async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.tilesData.qualifications = qualifications;
    fixture.detectChanges();

    const content = getByText(`: ${FormatUtil.formatPercent(qualifications.workplaceValue.value)}`);
    expect(content).toBeTruthy();
  });

  it('should not show tile info for sickness in the title if hasValue is false', async () => {
    const { queryAllByText } = await setup();

    const content = queryAllByText(`Days`);
    expect(content.length).toEqual(0);
  });

  describe('calculateJourneyType', () => {
    it('should calculate the correct journey type when the workplace is the primary workplace', async () => {
      const { fixture } = await setup();

      fixture.componentInstance.establishmentUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.calculateJourneyType();
      fixture.detectChanges();

      expect(fixture.componentInstance.journeyType).toEqual('dashboard');
    });

    it('should calculate the correct journey type when the workplace is a subsidiary', async () => {
      const { fixture } = await setup();

      fixture.componentInstance.establishmentUid = '1234';
      fixture.componentInstance.primaryWorkplaceUid = '98a83eef-e1e1-49f3-89c5-b1287a3cc8de';
      fixture.componentInstance.calculateJourneyType();
      fixture.detectChanges();

      expect(fixture.componentInstance.journeyType).toEqual('workplace');
    });
  });
});
