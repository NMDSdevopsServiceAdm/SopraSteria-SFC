import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadPageComponent } from './bulk-upload-page.component';

describe('BulkUploadPageComponent', () => {
  let component: BulkUploadPageComponent;
  let fixture: ComponentFixture<BulkUploadPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkUploadPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
