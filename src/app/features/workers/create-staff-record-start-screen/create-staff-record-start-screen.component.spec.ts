import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStaffRecordStartScreenComponent } from './create-staff-record-start-screen.component';

describe('CreateStaffRecordStartScreenComponent', () => {
  let component: CreateStaffRecordStartScreenComponent;
  let fixture: ComponentFixture<CreateStaffRecordStartScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateStaffRecordStartScreenComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStaffRecordStartScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
