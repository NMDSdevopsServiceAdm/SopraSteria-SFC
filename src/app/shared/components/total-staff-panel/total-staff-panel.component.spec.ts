import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalStaffPanelComponent } from './total-staff-panel.component';

describe('TotalStaffPanelComponent', () => {
  let component: TotalStaffPanelComponent;
  let fixture: ComponentFixture<TotalStaffPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TotalStaffPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalStaffPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
