import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalStaffComponent } from './total-staff.component';

describe('TotalStaffComponent', () => {
  let component: TotalStaffComponent;
  let fixture: ComponentFixture<TotalStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TotalStaffComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
