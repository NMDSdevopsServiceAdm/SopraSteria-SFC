import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Question } from './question.component';

describe('Question', () => {
  let component: Question;
  let fixture: ComponentFixture<Question>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Question],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Question);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
