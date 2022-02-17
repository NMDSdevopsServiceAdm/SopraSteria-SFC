import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render, screen } from '@testing-library/angular';

import { Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
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

  it('should render the default view', async () => {
    await setup();

    expect(screen.getByText('Save and continue')).toBeTruthy();
    expect(screen.getByText('View record summary')).toBeTruthy();
    expect(screen.getByText('Exit')).toBeTruthy();
  });

  it('should render the correctly based if "staff-record" route', async () => {
    url = '/staff-record';
    await setup();

    expect(screen.getByText('Save and continue')).toBeTruthy();
    expect(screen.getByText('View this staff record')).toBeTruthy();
    expect(screen.queryByText('Exit')).toBe(null);
  });

  it('should emit events on button click', async () => {
    const { fixture } = await setup();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Save and continue'));
    expect(spy).toHaveBeenCalledWith({ action: 'continue', save: true });

    fireEvent.click(screen.getByText('View record summary'));
    expect(spy).toHaveBeenCalledWith({ action: 'summary', save: false });

    fireEvent.click(screen.getByText('Exit'));
    expect(spy).toHaveBeenCalledWith({ action: 'exit', save: false });
  });
});
