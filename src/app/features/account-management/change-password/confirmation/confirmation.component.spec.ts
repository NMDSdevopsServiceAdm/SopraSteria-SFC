import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordConfirmationComponent } from './confirmation.component';

describe('ChangePasswordConfirmationComponent', () => {
  let component: ChangePasswordConfirmationComponent;
  let fixture: ComponentFixture<ChangePasswordConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChangePasswordConfirmationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
