import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmStaffVacanciesComponent } from './confirm-staff-vacancies.component';

describe('ConfirmStaffVacanciesComponent', () => {
  let component: ConfirmStaffVacanciesComponent;
  let fixture: ComponentFixture<ConfirmStaffVacanciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmStaffVacanciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmStaffVacanciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
