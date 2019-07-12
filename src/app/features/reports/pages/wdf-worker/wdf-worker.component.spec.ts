import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfWorkerComponent } from '@features/reports/wdf-worker/wdf-worker.component';

describe('ReportsStaffSummaryComponent', () => {
  let component: WdfWorkerComponent;
  let fixture: ComponentFixture<WdfWorkerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WdfWorkerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
