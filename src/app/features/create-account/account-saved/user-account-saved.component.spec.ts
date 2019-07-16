import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccountSavedComponent } from './user-account-saved.component';

describe('UserAccountSavedComponent', () => {
  let component: UserAccountSavedComponent;
  let fixture: ComponentFixture<UserAccountSavedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccountSavedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountSavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
