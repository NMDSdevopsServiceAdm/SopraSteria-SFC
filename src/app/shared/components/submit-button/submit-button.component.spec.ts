import { RouterTestingModule } from '@angular/router/testing';
import { render, fireEvent, screen } from '@testing-library/angular';

import { SubmitButtonComponent } from './submit-button.component';

describe('SubmitButtonComponent', () => {
  const setup = async () =>
    render(SubmitButtonComponent, {
      imports: [RouterTestingModule],
      componentProperties: {
        exitText: 'Exit',
      },
    });

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the correct exit text with a fallback', async () => {
    const { rerender } = await setup();

    expect(screen.getByText('Exit')).toBeTruthy();

    // update directive
    rerender({ exitText: 'Cancel FooBar' });
    expect(screen.getByText('Cancel FooBar')).toBeTruthy();
  });
});
