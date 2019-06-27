import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadReferencesHeaderComponent } from './bulk-upload-references-header.component';

describe('BulkUploadReferencesHeaderComponent', () => {
  let component: BulkUploadReferencesHeaderComponent;
  let fixture: ComponentFixture<BulkUploadReferencesHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkUploadReferencesHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadReferencesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
