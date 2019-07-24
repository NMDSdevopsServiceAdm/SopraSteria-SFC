import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfConfirmationDialogComponent } from './wdf-confirmation-dialog.component';

describe('WdfConfirmationDialogComponent', () => {
  let component: WdfConfirmationDialogComponent;
  let fixture: ComponentFixture<WdfConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WdfConfirmationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
