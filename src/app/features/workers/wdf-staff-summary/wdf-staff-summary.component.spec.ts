import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfStaffSummaryComponent } from './wdf-staff-summary.component';

describe('ReportsStaffSummaryComponent', () => {
  let component: WdfStaffSummaryComponent;
  let fixture: ComponentFixture<WdfStaffSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WdfStaffSummaryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfStaffSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
