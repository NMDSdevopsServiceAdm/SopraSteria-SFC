import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SendEmailsConfirmationDialogComponent } from './send-emails-confirmation-dialog.component';

describe('SendEmailsConfirmationDialogComponent', () => {
  async function setup() {
    return render(SendEmailsConfirmationDialogComponent, {
      imports: [
        SharedModule,
      ],
      providers: [
        { provide: DIALOG_DATA, useValue: {} },
        { provide: Dialog, useValue: {} }
    ]
    });
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });
});
