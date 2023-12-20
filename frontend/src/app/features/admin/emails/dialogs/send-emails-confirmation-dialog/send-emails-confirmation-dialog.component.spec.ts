import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SendEmailsConfirmationDialogComponent } from './send-emails-confirmation-dialog.component';

describe('SendEmailsConfirmationDialogComponent', () => {
  async function setup() {
    return render(SendEmailsConfirmationDialogComponent, {
      imports: [SharedModule],
      providers: [
        { provide: DIALOG_DATA, useValue: {} },
        { provide: Dialog, useValue: {} },
      ],
    });
  }

  it('should display confirmation dialog', async () => {
    const component = await setup();
    component.fixture.componentInstance.data.emailCount = 10;
    component.fixture.detectChanges(true);
    const p = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).toContain('This will send an email to 10 users.');
  });

  it('should pluralise the confirmation dialog', async () => {
    const component = await setup();
    component.fixture.componentInstance.data.emailCount = 1;
    component.fixture.detectChanges(true);
    const p = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).toContain('This will send an email to 1 user.');
  });
});
