import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarchartComponent } from './barchart.component';

fdescribe('BenchmarksTabComponent', () => {
  let component: BarchartComponent;
  let fixture: ComponentFixture<BarchartComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
