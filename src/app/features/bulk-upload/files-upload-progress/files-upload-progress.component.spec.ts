import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesUploadProgressComponent } from './files-upload-progress.component';

describe('FilesUploadProgressComponent', () => {
  let component: FilesUploadProgressComponent;
  let fixture: ComponentFixture<FilesUploadProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilesUploadProgressComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesUploadProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
