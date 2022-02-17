import { RouterTestingModule } from '@angular/router/testing';
import { render, fireEvent, screen } from '@testing-library/angular';

import { Router } from '@angular/router';
import { SubmitButtonComponent } from './submit-button.component';

fdescribe('SubmitButtonComponent', () => {
  let url = '';

  beforeEach(() => {
    url = '';
  });

  const setup = async () =>
    render(SubmitButtonComponent, {
      imports: [RouterTestingModule],
      componentProperties: {
        exitText: 'Exit',
      },
      providers: [
        {
          provide: Router,
          useValue: { url },
        },
      ],
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

  it('should render the default summary text based', async () => {
    await setup();

    expect(screen.getByText('View record summary')).toBeTruthy();
  });

  it('should render the correct summary text based if "staff-record" route', async () => {
    url = '/staff-record';
    await setup();

    expect(screen.getByText('View this staff record')).toBeTruthy();
  });
});
