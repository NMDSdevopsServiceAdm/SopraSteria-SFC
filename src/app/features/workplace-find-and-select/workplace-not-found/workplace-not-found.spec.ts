import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceNotFound } from './workplace-not-found';

describe('WorkplaceNotFound', () => {
  let component: WorkplaceNotFound;
  let fixture: ComponentFixture<WorkplaceNotFound>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkplaceNotFound],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceNotFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
