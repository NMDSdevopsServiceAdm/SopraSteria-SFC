import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfConfirmationPanelComponent } from './wdf-confirmation-panel.component';

describe('WdfConfirmationPanelComponent', () => {
  let component: WdfConfirmationPanelComponent;
  let fixture: ComponentFixture<WdfConfirmationPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WdfConfirmationPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfConfirmationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
