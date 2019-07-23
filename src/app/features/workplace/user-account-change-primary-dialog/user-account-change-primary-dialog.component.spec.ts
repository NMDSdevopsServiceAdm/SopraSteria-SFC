import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccountChangePrimaryDialogComponent } from './user-account-change-primary-dialog.component';

describe('UserAccountChangePrimaryDialogComponent', () => {
  let component: UserAccountChangePrimaryDialogComponent;
  let fixture: ComponentFixture<UserAccountChangePrimaryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccountChangePrimaryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountChangePrimaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
