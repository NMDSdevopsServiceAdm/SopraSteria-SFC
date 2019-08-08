import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffSummaryComponent } from './staff-summary.component';

describe('StaffSummaryComponent', () => {
  let component: StaffSummaryComponent;
  let fixture: ComponentFixture<StaffSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
