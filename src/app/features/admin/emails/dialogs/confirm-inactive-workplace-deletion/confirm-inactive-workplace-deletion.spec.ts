import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ConfirmInactiveWorkplaceDeletionComponent } from './confirm-inactive-workplace-deletion';

describe('ConfirmInactiveWorkplaceDeletionComponent', () => {
  const setup = async (numberOfInactiveWorkplacesForDeletion) => {
    const { fixture } = await render(ConfirmInactiveWorkplaceDeletionComponent, {
      imports: [SharedModule],
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: {
            numberOfInactiveWorkplacesForDeletion,
          },
        },
        { provide: Dialog, useValue: {} },
      ],
    });
    return { fixture };
  };

  it('should display confirmation dialog', async () => {
    const { fixture } = await setup(1);
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.innerText).toContain(`You're about to delete 1 inactive account`);
  });

  it('should pluralise the confirmation dialog', async () => {
    const { fixture } = await setup(432);
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.innerText).toContain(`You're about to delete 432 inactive accounts`);
  });
});
