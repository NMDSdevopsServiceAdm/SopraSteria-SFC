import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDataFilesComponent } from './upload-data-files.component';

describe('UploadDataFilesComponent', () => {
  let component: UploadDataFilesComponent;
  let fixture: ComponentFixture<UploadDataFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDataFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDataFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
