import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FormatUtil } from '@core/utils/format-util';
import { BenchmarksTabComponent } from '@shared/components/benchmarks-tab/benchmarks-tab.component';

import { Establishment } from '../../../../mockdata/establishment';

describe('BenchmarksTabComponent', () => {
  let component: BenchmarksTabComponent;
  let fixture: ComponentFixture<BenchmarksTabComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, HttpClientTestingModule],
        declarations: [],
        providers: [
          { provide: BenchmarksService, useClass: MockBenchmarksService },
          { provide: PermissionsService, useClass: MockPermissionsService },
        ],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BenchmarksTabComponent);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to build with only part of the data', () => {
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
    const event = new Event('click');
    const pdfDownload = spyOn(component, 'downloadAsPDF').and.callThrough();
    const downloadPDF = await component.downloadAsPDF(event);
    expect(pdfDownload).toHaveBeenCalled();
    expect(downloadPDF.getNumberOfPages()).toEqual(2);
  });
});
