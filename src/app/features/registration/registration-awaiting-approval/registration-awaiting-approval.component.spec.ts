import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationAwaitingApprovalComponent } from './registration-awaiting-approval.component';

describe('RegistrationCompleteComponent', () => {
  let component: RegistrationAwaitingApprovalComponent;
  let fixture: ComponentFixture<RegistrationAwaitingApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrationAwaitingApprovalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationAwaitingApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
