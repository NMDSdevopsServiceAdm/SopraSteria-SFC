import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherJobRolesComponent } from './other-job-roles.component';

describe('OtherJobRolesComponent', () => {
  let component: OtherJobRolesComponent;
  let fixture: ComponentFixture<OtherJobRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OtherJobRolesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherJobRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
