import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmAccountDetailsComponent } from './confirm-account-details.component';

describe('ConfirmAccountDetailsComponent', () => {
  let component: ConfirmAccountDetailsComponent;
  let fixture: ComponentFixture<ConfirmAccountDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmAccountDetailsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
