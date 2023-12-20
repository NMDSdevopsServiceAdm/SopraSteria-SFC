import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationErrorMessageComponent } from './validation-error-message.component';

describe('ValidationErrorMessageComponent', () => {
  let component: ValidationErrorMessageComponent;
  let fixture: ComponentFixture<ValidationErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidationErrorMessageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
