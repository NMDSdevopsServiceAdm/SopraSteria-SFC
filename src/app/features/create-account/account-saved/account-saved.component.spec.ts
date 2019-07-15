import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSavedComponent } from './account-saved.component';

describe('AccountSavedComponent', () => {
  let component: AccountSavedComponent;
  let fixture: ComponentFixture<AccountSavedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountSavedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
