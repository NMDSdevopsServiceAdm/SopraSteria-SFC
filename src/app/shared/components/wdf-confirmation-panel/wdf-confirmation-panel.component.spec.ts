import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { WdfConfirmationPanelComponent } from './wdf-confirmation-panel.component';

describe('WdfConfirmationPanelComponent', () => {
  let component: WdfConfirmationPanelComponent;
  let fixture: ComponentFixture<WdfConfirmationPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [WdfConfirmationPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfConfirmationPanelComponent);
    component = fixture.componentInstance;
    component.exitUrl = { url: ['/dashboard'], fragment: 'dashboard' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
