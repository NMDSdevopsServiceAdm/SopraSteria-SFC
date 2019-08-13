import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccountEditDetailsComponent } from './user-account-edit-details.component';

describe('UserAccountEditDetailsComponent', () => {
  let component: UserAccountEditDetailsComponent;
  let fixture: ComponentFixture<UserAccountEditDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserAccountEditDetailsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountEditDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
