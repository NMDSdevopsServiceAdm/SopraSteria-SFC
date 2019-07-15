import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SecurityQuestion } from './security-question';

describe('SecurityQuestion', () => {
  let component: SecurityQuestion;
  let fixture: ComponentFixture<SecurityQuestion>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecurityQuestion],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
