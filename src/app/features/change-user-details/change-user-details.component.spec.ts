import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUserDetailsComponent } from './change-user-details.component';

describe('ChangeUserDetailsComponent', () => {
  let component: ChangeUserDetailsComponent;
  let fixture: ComponentFixture<ChangeUserDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeUserDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeUserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
