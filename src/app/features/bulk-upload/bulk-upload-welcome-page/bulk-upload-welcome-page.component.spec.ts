import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadWelcomePageComponent } from './bulk-upload-welcome-page.component';

describe('BulkUploadWelcomePageComponent', () => {
  let component: BulkUploadWelcomePageComponent;
  let fixture: ComponentFixture<BulkUploadWelcomePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkUploadWelcomePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadWelcomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
