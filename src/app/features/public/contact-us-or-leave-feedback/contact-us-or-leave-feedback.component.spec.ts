import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsOrLeaveFeedbackComponent } from './contact-us-or-leave-feedback.component';

describe('ContactUsOrLeaveFeedbackComponent', () => {
  let component: ContactUsOrLeaveFeedbackComponent;
  let fixture: ComponentFixture<ContactUsOrLeaveFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactUsOrLeaveFeedbackComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUsOrLeaveFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
