import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfWorkplaceConfirmationDialogComponent } from './wdf-workplace-confirmation-dialog.component';

describe('WdfWorkplaceConfirmationDialogComponent', () => {
  let component: WdfWorkplaceConfirmationDialogComponent;
  let fixture: ComponentFixture<WdfWorkplaceConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WdfWorkplaceConfirmationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfWorkplaceConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
