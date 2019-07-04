import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadReferences } from './bulk-upload-references';

describe('BulkUploadReferences', () => {
  let component: BulkUploadReferences;
  let fixture: ComponentFixture<BulkUploadReferences>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkUploadReferences ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadReferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
