import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CqcRegisteredQuestionEditComponent } from './cqc-registered-question-edit.component';

describe('CqcRegisteredQuestionEditComponent', () => {
  let component: CqcRegisteredQuestionEditComponent;
  let fixture: ComponentFixture<CqcRegisteredQuestionEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CqcRegisteredQuestionEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CqcRegisteredQuestionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
