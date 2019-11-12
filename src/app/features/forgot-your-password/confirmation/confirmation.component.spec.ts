import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotYourPasswordConfirmationComponent } from './confirmation.component';

describe('ConfirmationComponent', () => {
  let component: ForgotYourPasswordConfirmationComponent;
  let fixture: ComponentFixture<ForgotYourPasswordConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotYourPasswordConfirmationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotYourPasswordConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
