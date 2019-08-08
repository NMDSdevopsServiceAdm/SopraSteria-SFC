import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccountDeleteDialogComponent } from './user-account-delete-dialog.component';

describe('UserAccountDeleteDialogComponent', () => {
  let component: UserAccountDeleteDialogComponent;
  let fixture: ComponentFixture<UserAccountDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccountDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
