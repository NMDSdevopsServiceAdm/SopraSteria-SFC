import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceSummaryComponent } from './workplace-summary.component';

describe('WorkplaceSummaryComponent', () => {
  let component: WorkplaceSummaryComponent;
  let fixture: ComponentFixture<WorkplaceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkplaceSummaryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
