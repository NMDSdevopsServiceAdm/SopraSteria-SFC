import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadWarningDialogComponent } from './upload-warning-dialog.component';

describe('UploadWarningDialogComponent', () => {
  let component: UploadWarningDialogComponent;
  let fixture: ComponentFixture<UploadWarningDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UploadWarningDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadWarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
