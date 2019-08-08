import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUserSecurityComponent } from './change-user-security.component';

describe('ChangeUserSecurityComponent', () => {
  let component: ChangeUserSecurityComponent;
  let fixture: ComponentFixture<ChangeUserSecurityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeUserSecurityComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeUserSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
