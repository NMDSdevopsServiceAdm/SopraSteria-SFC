import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CqcRegisteredQuestionComponent } from './cqc-registered-question.component';

describe('CqcRegisteredQuestionComponent', () => {
  let component: CqcRegisteredQuestionComponent;
  let fixture: ComponentFixture<CqcRegisteredQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CqcRegisteredQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CqcRegisteredQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
