import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceSubTabComponent } from './workplace-sub-tab.component';

describe('WorkplaceSubTabComponent', () => {
  let component: WorkplaceSubTabComponent;
  let fixture: ComponentFixture<WorkplaceSubTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkplaceSubTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceSubTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
