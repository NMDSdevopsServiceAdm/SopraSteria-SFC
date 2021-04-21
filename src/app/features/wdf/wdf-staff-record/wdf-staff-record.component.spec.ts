import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfStaffRecordComponent } from './wdf-staff-record.component';

describe('WdfStaffRecordComponent', () => {
  let component: WdfStaffRecordComponent;
  let fixture: ComponentFixture<WdfStaffRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WdfStaffRecordComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfStaffRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
