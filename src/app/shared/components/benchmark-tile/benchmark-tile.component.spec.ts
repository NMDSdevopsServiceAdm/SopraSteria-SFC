import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Metric } from '@core/model/benchmarks.model';

import { BenchmarkTileComponent } from './benchmark-tile.component';

fdescribe('BenchmarkTileComponent', () => {
  let component: BenchmarkTileComponent;
  let fixture: ComponentFixture<BenchmarkTileComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BenchmarkTileComponent);
    component = fixture.componentInstance;
    component.content = {
      title: 'Test title',
      description: 'Test description',
      noData: {},
      type: Metric.pay,
    };
    component.tile = {
      workplaceValue: {
        value: 800,
        hasValue: true,
      },
      comparisonGroup: {
        value: 1000,
        hasValue: true,
      },
      goodCqc: {
        value: 1000,
        hasValue: true,
      },
      lowTurnover: {
        value: 1000,
        hasValue: true,
      },
    };
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should show title', async () => {
    expect(fixture.nativeElement.querySelector('h2').innerText).toEqual('Test title');
  });

  it('should show description', async () => {
    expect(fixture.nativeElement.querySelector('p').innerText).toEqual('Test description');
  });

  it('should have the correct class on the your workplace p when show your workplace is true', async () => {
    expect(fixture.nativeElement.querySelector(`p[data-testid='yourworkplace']`).className).toEqual(
      'govuk-!-margin-bottom-0 asc-tile-key-text asc-color-turquoise asc-tile-key-number',
    );
  });

  it('should have the correct class on the your workplace p when show your workplace is false', async () => {
    component.tile.workplaceValue = {
      value: null,
      hasValue: false,
      stateMessage: 'Empty states',
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(`p[data-testid='yourworkplace']`).className).toEqual(
      'govuk-!-margin-bottom-0 asc-tile-key-text govuk-body-s',
    );
  });

  it('should have the correct class on the comparison group p when show comparison group is true', async () => {
    expect(fixture.nativeElement.querySelector(`p[data-testid='comparisongroup']`).className).toEqual(
      'govuk-!-margin-bottom-0 asc-tile-key-text asc-color-turquoise asc-tile-key-number',
    );
  });

  it('should have the correct class on the comparison group p when show comparison group is false', async () => {
    component.tile.comparisonGroup = {
      value: null,
      hasValue: false,
      stateMessage: 'Empty states',
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(`p[data-testid='comparisongroup']`).className).toEqual(
      'govuk-!-margin-bottom-0 asc-tile-key-text govuk-body-s',
    );
  });
});
