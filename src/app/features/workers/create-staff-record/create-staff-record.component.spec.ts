import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStaffRecordComponent } from './create-staff-record.component';

describe('CreateStaffRecordComponent', () => {
  let component: CreateStaffRecordComponent;
  let fixture: ComponentFixture<CreateStaffRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateStaffRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStaffRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
