import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotYourPasswordComponent } from './forgot-your-password.component';

describe('ForgotYourPasswordComponent', () => {
  let component: ForgotYourPasswordComponent;
  let fixture: ComponentFixture<ForgotYourPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotYourPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotYourPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
