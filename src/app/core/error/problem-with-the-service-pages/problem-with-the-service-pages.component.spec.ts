import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemWithTheServicePagesComponent } from './problem-with-the-service-pages.component';

describe('ProblemWithTheServicePagesComponent', () => {
  let component: ProblemWithTheServicePagesComponent;
  let fixture: ComponentFixture<ProblemWithTheServicePagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemWithTheServicePagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemWithTheServicePagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
