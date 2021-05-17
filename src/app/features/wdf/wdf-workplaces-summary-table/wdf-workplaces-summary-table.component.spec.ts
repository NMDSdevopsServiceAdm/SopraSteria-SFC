import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfWorkplacesSummaryTableComponent } from './wdf-workplaces-summary-table.component';

describe('WdfWorkplacesSummaryTableComponent', () => {
  let component: WdfWorkplacesSummaryTableComponent;
  let fixture: ComponentFixture<WdfWorkplacesSummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WdfWorkplacesSummaryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfWorkplacesSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
