import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateStaffVacanciesComponent } from './update-staff-vacancies.component';

describe('UpdateStaffVacanciesComponent', () => {
  let component: UpdateStaffVacanciesComponent;
  let fixture: ComponentFixture<UpdateStaffVacanciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateStaffVacanciesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateStaffVacanciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
