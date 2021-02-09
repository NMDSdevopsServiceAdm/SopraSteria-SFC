import { DialogService } from '@core/services/dialog.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { EmailsComponent } from './emails.component';

describe('EmailsComponent', () => {
  async function setup() {
    return render(EmailsComponent, {
      imports: [
        SharedModule,
      ],
      providers: [
        DialogService,
      ],
    });
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });
});
