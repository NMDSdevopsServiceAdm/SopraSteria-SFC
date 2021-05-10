import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfStaffMismatchMessageComponent } from './wdf-staff-mismatch-message.component';

describe('WdfStaffMismatchMessageComponent', () => {
  let component: WdfStaffMismatchMessageComponent;
  let fixture: ComponentFixture<WdfStaffMismatchMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WdfStaffMismatchMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfStaffMismatchMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
