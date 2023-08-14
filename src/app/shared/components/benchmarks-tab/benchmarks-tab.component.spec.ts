import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FormatUtil } from '@core/utils/format-util';
import { BenchmarksTabComponent } from '@shared/components/benchmarks-tab/benchmarks-tab.component';
import { Establishment } from '../../../../mockdata/establishment';
import { PdfService } from '@core/services/pdf.service';
import { fireEvent, render } from '@testing-library/angular';

describe('BenchmarksTabComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(BenchmarksTabComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BenchmarksService, useClass: MockBenchmarksService },
        { provide: PermissionsService, useClass: MockPermissionsService },
      ],
      declarations: [],
      componentProperties: {
        workplace: Establishment,
      },
    });
    const component = fixture.componentInstance;

    const injector = getTestBed();

    const pdfService = injector.inject(PdfService) as PdfService;

    return {
      component,
      getByText,
      pdfService,
      fixture,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should be able to build with only part of the data', async () => {
    const { component, fixture } = await setup();
    const tileData = {
      tiles: {
        pay: {
          workplaceValue: {
            value: 10,
            hasValue: false,
          },
          comparisonGroup: {
            value: 0,
            hasValue: false,
          },
          goodCqc: {
            value: 0,
            hasValue: false,
          },
          lowTurnover: {
            value: 0,
            hasValue: false,
          },
        },
      },
      meta: {
        workplaces: 10,
        staff: 100,
        updated: null,
        localAuthority: 'Test LA',
      },
    };
    component.tilesData = tileData;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should format Pay data correctly', () => {
    const paydata = FormatUtil.formatMoney(512.345);
    expect(paydata).toBe('£5.12');
  });

  it('should format percent data correctly', () => {
    const percentData = FormatUtil.formatPercent(0.357894767643573);
    expect(percentData).toBe('36%');
  });

  it('should download a pdf', async () => {
    const { component, getByText, pdfService } = await setup();

    const pdfDownload = spyOn(component, 'downloadAsPDF').and.callThrough();
    const pdfServiceSpy = spyOn(pdfService, 'BuildBenchmarksPdf').and.callThrough();

    fireEvent.click(getByText('Download Benchmarks PDF', { exact: false }));

    expect(pdfDownload).toHaveBeenCalled();
    expect(pdfServiceSpy).toHaveBeenCalled();
  });
});
