import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffRecordComponent } from './staff-record.component';

describe('StaffRecordComponent', () => {
  let component: StaffRecordComponent;
  let fixture: ComponentFixture<StaffRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StaffRecordComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
