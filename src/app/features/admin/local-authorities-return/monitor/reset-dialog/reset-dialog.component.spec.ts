import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ResetDialogComponent } from './reset-dialog.component';

describe('ResetDialogComponent', () => {
  async function setup() {
    return render(ResetDialogComponent, {
      imports: [SharedModule],
      providers: [
        { provide: DIALOG_DATA, useValue: {} },
        { provide: Dialog, useValue: {} },
      ],
    });
  }

  it('should display confirmation dialog', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('should reply with true when reset button is pressed', async () => {
    const component = await setup();

    const spy = spyOn(component.fixture.componentInstance, 'close');

    const resetButton = component.getByText('Reset returns data');
    fireEvent.click(resetButton);

    component.fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should reply with false when cancel button is pressed', async () => {
    const component = await setup();

    const spy = spyOn(component.fixture.componentInstance, 'close');

    const cancelButton = component.getByText('Cancel');
    fireEvent.click(cancelButton);

    component.fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(false);
  });
});
