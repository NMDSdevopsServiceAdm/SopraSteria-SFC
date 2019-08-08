import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryRecordValueComponent } from './summary-record-value.component';

describe('StaffRecordValueComponent', () => {
  let component: SummaryRecordValueComponent;
  let fixture: ComponentFixture<SummaryRecordValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SummaryRecordValueComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryRecordValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
