import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadStartPageComponent } from './bulk-upload-start-page.component';

describe('BulkUploadStartPageComponent', () => {
  let component: BulkUploadStartPageComponent;
  let fixture: ComponentFixture<BulkUploadStartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUploadStartPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadStartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
