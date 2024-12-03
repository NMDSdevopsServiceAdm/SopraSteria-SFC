import { ForgotYourUsernameOrPasswordComponent } from './forgot-your-username-or-password.component';
import { render, within } from '@testing-library/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

fdescribe('ForgotYourUsernameOrPasswordComponent', () => {
  const setup = async () => {
    const setupTools = await render(ForgotYourUsernameOrPasswordComponent, {
      imports: [FormsModule, ReactiveFormsModule, SharedModule],
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();

      expect(getByRole('heading', { name: 'Forgot your username or password?' })).toBeTruthy();
    });

    it('should show radio buttons to choose from Username or Password', async () => {
      const { getByRole } = await setup();

      expect(getByRole('radio', { name: 'Username' })).toBeTruthy();
      expect(getByRole('radio', { name: 'Password' })).toBeTruthy();
    });

    it('it should show an reveal text of "Forgot both?"', async () => {
      const { getByTestId } = await setup();

      const revealText = getByTestId('reveal-text');
      const expectedText =
        'Request a link to reset your password and then come back here to find your username. Alternatively, call the ASC-WDS Support Team on 0113 241 0969 for help.';

      expect(revealText).toBeTruthy();
      expect(within(revealText).getByText('Forgot both?')).toBeTruthy();
      expect(revealText.textContent).toContain(expectedText);
    });

    it('should show a "Continue" CTA button and a "Back to sign in" link', async () => {
      const { getByText, getByRole } = await setup();

      expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
      expect(getByText('Back to sign in')).toBeTruthy();
    });
  });
});
