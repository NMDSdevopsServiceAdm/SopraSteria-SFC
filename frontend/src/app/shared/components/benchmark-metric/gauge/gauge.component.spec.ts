import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Highcharts from 'highcharts';
import Accessibility from 'highcharts/modules/accessibility';

import { GaugeComponent } from './gauge.component';

describe('GaugeComponent', () => {
  let component: GaugeComponent;
  let fixture: ComponentFixture<GaugeComponent>;

  const suppressHighchartWarnings = () => {
    const allowedAttr = Highcharts.AST.allowedAttributes;
    allowedAttr.push('data-testid');
    Accessibility(Highcharts);
  };

  beforeAll(() => {
    // TODO: this suppress the highchart warnings in unit tests
    // by allowing data-testid in html template and enabling highchart accessibility module.
    // we should consider to put these changes in working code as well when we have the opportunity
    suppressHighchartWarnings();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it("shouldn't show ranks", async () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByClassName('govuk-body').length).toEqual(2);
  });
});
