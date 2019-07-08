import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffRecordSummaryComponent } from './staff-record-summary.component';

describe('StaffRecordSummaryComponent', () => {
  let component: StaffRecordSummaryComponent;
  let fixture: ComponentFixture<StaffRecordSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StaffRecordSummaryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffRecordSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
