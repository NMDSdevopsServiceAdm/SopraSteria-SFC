import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmVacanciesComponent } from './confirm-vacancies.component';

describe('ConfirmVacanciesComponent', () => {
  let component: ConfirmVacanciesComponent;
  let fixture: ComponentFixture<ConfirmVacanciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmVacanciesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmVacanciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
