import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDetails } from './account-details';

describe('AccountDetails', () => {
  let component: AccountDetails;
  let fixture: ComponentFixture<AccountDetails>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountDetails ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
