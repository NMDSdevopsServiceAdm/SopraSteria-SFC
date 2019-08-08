import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotYourPasswordEditComponent } from '@features/forgot-your-password/edit/edit.component';

describe('ForgotYourPasswordEditComponent', () => {
  let component: ForgotYourPasswordEditComponent;
  let fixture: ComponentFixture<ForgotYourPasswordEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotYourPasswordEditComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotYourPasswordEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
