import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUsernameComponent } from './create-username.component';

describe('CreateUsernameComponent', () => {
  let component: CreateUsernameComponent;
  let fixture: ComponentFixture<CreateUsernameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateUsernameComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
