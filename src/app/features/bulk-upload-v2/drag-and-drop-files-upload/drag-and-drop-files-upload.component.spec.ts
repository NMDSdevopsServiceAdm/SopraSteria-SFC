import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragAndDropFilesUploadComponent } from './drag-and-drop-files-upload.component';

describe('DragAndDropFilesUploadComponent', () => {
  let component: DragAndDropFilesUploadComponent;
  let fixture: ComponentFixture<DragAndDropFilesUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DragAndDropFilesUploadComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragAndDropFilesUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
