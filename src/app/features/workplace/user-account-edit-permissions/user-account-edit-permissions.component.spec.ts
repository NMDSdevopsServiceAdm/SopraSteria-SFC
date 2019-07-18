import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccountEditPermissionsComponent } from './user-account-edit-permissions.component';

describe('UserAccountEditPermissionsComponent', () => {
  let component: UserAccountEditPermissionsComponent;
  let fixture: ComponentFixture<UserAccountEditPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccountEditPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountEditPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
