import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { BenchmarksMetricComponent } from '@shared/components/benchmarks-tab/metric/metric.component';
import { within } from '@testing-library/angular';

describe('BenchmarksMetricComponent', () => {
  let component: BenchmarksMetricComponent;
  let fixture: ComponentFixture<BenchmarksMetricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BenchmarksModule],
      declarations: [],
      providers: [
        { provide: BenchmarksService, useClass: MockBenchmarksService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
              params: {
                establishmentID: 123,
              },
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BenchmarksMetricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have the right text with only one workplace', async () => {
    fixture.detectChanges();
    const componenttext = await within(document.body).findByTestId('meta-data');
    expect(componenttext.innerHTML).toContain(
      `is 1 staff from 1 workplace providing the same main service as you in your local authority`,
    );
  });
  it('should have the right text with correct comma placement', async () => {
    fixture.detectChanges();
    const componenttext = await within(document.body).findByTestId('meta-data');
    expect(componenttext.innerHTML).toContain(
      `is 1,000 staff from 1,000 workplaces providing the same main service as you in your local authority`,
    );
  });
  it('should have the right text with no data', async () => {
    fixture.detectChanges();
    const lineItemCount = fixture.debugElement.queryAll(By.css('li')).length;
    expect(lineItemCount).toBe(2);
  });
});
