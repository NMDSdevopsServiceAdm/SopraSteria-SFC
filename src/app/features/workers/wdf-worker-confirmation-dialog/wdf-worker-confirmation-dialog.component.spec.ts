import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfWorkerConfirmationDialogComponent } from './wdf-worker-confirmation-dialog.component';

describe('WdfConfirmationDialogComponent', () => {
  let component: WdfWorkerConfirmationDialogComponent;
  let fixture: ComponentFixture<WdfWorkerConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WdfWorkerConfirmationDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfWorkerConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
