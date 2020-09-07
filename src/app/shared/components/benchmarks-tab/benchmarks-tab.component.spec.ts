import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { BenchmarksTabComponent } from '@shared/components/benchmarks-tab/benchmarks-tab.component';

import { Establishment } from '../../../../mockdata/establishment';


fdescribe('BenchmarksTabComponent', () => {
  let component: BenchmarksTabComponent;
  let fixture: ComponentFixture<BenchmarksTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [{ provide: BenchmarksService, useClass: MockBenchmarksService }]
    }).compileComponents();
  }));

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
      tiles:{
        pay: {
          workplaceValue:
            {
              value: 10,
              hasValue: false
            },
          comparisonGroup:
            {
              value: 0,
              hasValue: false
            }
        },
    },
      meta:{
        workplaces: 10,
        staff: 100
      }
  };
    component.tilesData = tileData;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
  it('should format Pay data correctly', () => {
    const paydata = component.formatPay(512.345);
    expect(paydata).toBe('£5.12');
  });
  it('should format percent data correctly', () => {
    const percentData = component.formatPercent(0.357894767643573);
    expect(percentData).toBe('36%');
  });
  it('should download a pdf', () => {
    const event = new Event('click');
    const pdf = component.downloadAsPDF(event);
    console.log(pdf);
  });
});
