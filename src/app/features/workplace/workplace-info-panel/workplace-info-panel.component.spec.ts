import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceInfoPanelComponent } from './workplace-info-panel.component';

describe('WorkplaceInfoPanelComponent', () => {
  let component: WorkplaceInfoPanelComponent;
  let fixture: ComponentFixture<WorkplaceInfoPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkplaceInfoPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceInfoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
