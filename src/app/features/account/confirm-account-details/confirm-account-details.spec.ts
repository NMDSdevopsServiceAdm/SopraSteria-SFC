import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAccountDetails } from './confirm-account-details';

describe('ConfirmAccountDetails', () => {
  let component: ConfirmAccountDetails;
  let fixture: ComponentFixture<ConfirmAccountDetails>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmAccountDetails ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAccountDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
