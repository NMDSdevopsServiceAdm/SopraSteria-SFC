import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckStaffRecordComponent } from './check-staff-record.component';

describe('CheckStaffRecordComponent', () => {
  let component: CheckStaffRecordComponent;
  let fixture: ComponentFixture<CheckStaffRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CheckStaffRecordComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckStaffRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
