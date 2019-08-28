import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplacesComponent } from './workplaces.component';

describe('WorkplacesComponent', () => {
  let component: WorkplacesComponent;
  let fixture: ComponentFixture<WorkplacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
