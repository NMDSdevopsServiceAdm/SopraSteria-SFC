import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAccountViewComponent } from '@features/workplace/user-account-view/user-account-view.component';

describe('UserAccountViewComponent', () => {
  let component: UserAccountViewComponent;
  let fixture: ComponentFixture<UserAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserAccountViewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
