import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendEmailsConfirmationDialogComponent } from './send-emails-confirmation-dialog.component';

describe('SendEmailsConfirmationDialogComponent', () => {
  let component: SendEmailsConfirmationDialogComponent;
  let fixture: ComponentFixture<SendEmailsConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendEmailsConfirmationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendEmailsConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
