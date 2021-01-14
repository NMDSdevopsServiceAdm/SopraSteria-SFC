import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningDetailsTableComponent } from './warning-details-table.component';

describe('WarningDetailsTableComponent', () => {
  let component: WarningDetailsTableComponent;
  let fixture: ComponentFixture<WarningDetailsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WarningDetailsTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
