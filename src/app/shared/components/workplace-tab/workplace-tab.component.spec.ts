import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceTabComponent } from './workplace-tab.component';

describe('WorkplaceTabComponent', () => {
  let component: WorkplaceTabComponent;
  let fixture: ComponentFixture<WorkplaceTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkplaceTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
