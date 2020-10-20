import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeComponent } from './gauge.component';

fdescribe('BenchmarksTabComponent', () => {
  let component: GaugeComponent;
  let fixture: ComponentFixture<GaugeComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should show lowest rank', async () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByClassName('govuk-body')[1].innerText).toEqual('100Lowest ranking');
  });

  it('should show highest rank', async () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByClassName('govuk-body')[0].innerText).toEqual('Highest ranking 1');
  });
});
