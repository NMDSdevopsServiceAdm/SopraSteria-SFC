import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceNotFoundComponent } from './workplace-not-found.component';

describe('WorkplaceNotFoundComponent', () => {
  let component: WorkplaceNotFoundComponent;
  let fixture: ComponentFixture<WorkplaceNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceNotFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
