import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemWithTheServiceComponent } from './problem-with-the-service.component';

describe('ProblemWithTheServiceComponent', () => {
  let component: ProblemWithTheServiceComponent;
  let fixture: ComponentFixture<ProblemWithTheServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProblemWithTheServiceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemWithTheServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
