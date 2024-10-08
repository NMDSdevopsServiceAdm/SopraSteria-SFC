import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUploadCertificateComponent } from './select-upload-certificate.component';

describe('SelectUploadCertificateComponent', () => {
  let component: SelectUploadCertificateComponent;
  let fixture: ComponentFixture<SelectUploadCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectUploadCertificateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectUploadCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
