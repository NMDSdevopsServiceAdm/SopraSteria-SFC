import { fireEvent, render, within } from '@testing-library/angular';
import { FoundUsernameComponent } from './found-username.component';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';

describe('FoundUsernameComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(FoundUsernameComponent, {
      imports: [RouterModule, RouterTestingModule],
      declarations: [PageNotFoundComponent],
      providers: [],
      componentProperties: {
        username: overrides.username,
      },
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { ...setupTools, component, routerSpy };
  };

  it('should create', async () => {
    const overrides = {
      username: 'Bighitterhank1000',
    };

    const { component } = await setup(overrides);

    expect(component).toBeTruthy();
  });

  it('should show the panel', async () => {
    const overrides = {
      username: 'Bighitterhank1000',
    };

    const { getByTestId } = await setup(overrides);

    const panel = getByTestId('panel');

    expect(panel).toBeTruthy();
    expect(within(panel).getByText('We’ve found your username'));
  });

  it('should show the username', async () => {
    const overrides = {
      username: 'Bighitterhank1000',
    };

    const { getByTestId } = await setup(overrides);

    const panel = getByTestId('panel');
    expect(within(panel).getByText('Your username is'));
    expect(within(panel).getByText('Bighitterhank1000'));
  });

  it('should show a button to return to the sign in page', async () => {
    const overrides = {
      username: 'Bighitterhank1000',
    };

    const { getByText } = await setup(overrides);

    const buttonText = getByText('Back to sign in');

    expect(buttonText).toBeTruthy();
  });

  it('should go back to the sign in page when the button is clicked', async () => {
    const overrides = {
      username: 'Bighitterhank1000',
    };

    const { fixture, getByText, routerSpy } = await setup(overrides);

    const buttonText = getByText('Back to sign in');

    fireEvent.click(buttonText);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should show page not found if user lands on page and no username was found', async () => {
    const overrides = {
      username: null,
    };

    const { getByTestId } = await setup(overrides);

    expect(getByTestId('not-found')).toBeTruthy();
  });
});
