import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAccountsSummaryComponent } from '@shared/components/user-accounts-summary/user-accounts-summary.component';

describe('UserAccountsSummaryComponent', () => {
  let component: UserAccountsSummaryComponent;
  let fixture: ComponentFixture<UserAccountsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserAccountsSummaryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
