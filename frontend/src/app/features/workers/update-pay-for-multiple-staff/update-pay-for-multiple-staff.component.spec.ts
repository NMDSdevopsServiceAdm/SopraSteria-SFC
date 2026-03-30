import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePayForMultipleStaffComponent } from './update-pay-for-multiple-staff.component';

describe('UpdatePayForMultipleStaffComponent', () => {
  let component: UpdatePayForMultipleStaffComponent;
  let fixture: ComponentFixture<UpdatePayForMultipleStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePayForMultipleStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePayForMultipleStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
