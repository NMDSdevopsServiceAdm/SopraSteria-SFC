import { getTestBed } from '@angular/core/testing';

import { PasswordSavedConfirmationComponent } from './password-saved-confirmation.component';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import userEvent from '@testing-library/user-event';

fdescribe('PasswordSavedConfirmationComponent', () => {
  async function setup() {
    const setupTools = await render(PasswordSavedConfirmationComponent, {
      imports: [SharedModule, RouterModule],
      providers: [],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const component = setupTools.fixture.componentInstance;

    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      routerSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a h1 heading "Your new password has been saved"', async () => {
    const { getByRole } = await setup();
    const h1Heading = getByRole('heading', { level: 1 });
    expect(h1Heading.textContent).toEqual('Your new password has been saved');
  });

  it('should show a CTA button to return to sign in page', async () => {
    const { getByRole, routerSpy } = await setup();
    const button = getByRole('button', { name: 'Back to sign in' });

    userEvent.click(button);
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });
});
