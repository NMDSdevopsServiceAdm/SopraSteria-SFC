import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadDataFilesComponent } from './download-data-files.component';

describe('DownloadDataFilesComponent', () => {
  let component: DownloadDataFilesComponent;
  let fixture: ComponentFixture<DownloadDataFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadDataFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadDataFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
