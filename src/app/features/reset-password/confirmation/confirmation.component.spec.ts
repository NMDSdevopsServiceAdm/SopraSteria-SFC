import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordConfirmationComponent } from './confirmation.component';

describe('ResetPasswordConfirmationComponent', () => {
  let component: ResetPasswordConfirmationComponent;
  let fixture: ComponentFixture<ResetPasswordConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResetPasswordConfirmationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
