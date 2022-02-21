import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render, screen } from '@testing-library/angular';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SubmitButtonComponent } from './submit-button.component';

describe('SubmitButtonComponent', () => {
  const setup = async () =>
    render(SubmitButtonComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
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

  it('should render the default view', async () => {
    await setup();

    expect(screen.getByText('Save and continue')).toBeTruthy();
    expect(screen.getByText('View record summary')).toBeTruthy();
    expect(screen.getByText('Exit')).toBeTruthy();
  });

  it('should render the correctly if an isEditStaffRecord is true', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.isEditStaffRecord = true;
    fixture.detectChanges();

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
