import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VacanciesComponentComponent } from './vacancies-component.component';

describe('VacanciesComponentComponent', () => {
  let component: VacanciesComponentComponent;
  let fixture: ComponentFixture<VacanciesComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VacanciesComponentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VacanciesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
