import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUsername } from './create-username';

describe('CreateUsernameComponent', () => {
  let component: CreateUsername;
  let fixture: ComponentFixture<CreateUsername>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateUsername ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUsername);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
