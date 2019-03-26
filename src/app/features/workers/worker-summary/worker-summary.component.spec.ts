import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkerSummaryComponent } from './worker-summary.component';

describe('WorkerSummaryComponent', () => {
  let component: WorkerSummaryComponent;
  let fixture: ComponentFixture<WorkerSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkerSummaryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
