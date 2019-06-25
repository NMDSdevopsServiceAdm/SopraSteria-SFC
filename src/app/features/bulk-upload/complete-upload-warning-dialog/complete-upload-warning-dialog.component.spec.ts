import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteUploadWarningDialogComponent } from './complete-upload-warning-dialog';

describe('CompleteUploadWarningDialogComponent', () => {
  let component: CompleteUploadWarningDialogComponent;
  let fixture: ComponentFixture<CompleteUploadWarningDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompleteUploadWarningDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteUploadWarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
