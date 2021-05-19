import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfFieldConfirmationComponent } from './wdf-field-confirmation.component';

describe('WdfFieldConfirmationComponent', () => {
  let component: WdfFieldConfirmationComponent;
  let fixture: ComponentFixture<WdfFieldConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WdfFieldConfirmationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfFieldConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
