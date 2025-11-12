import { provideHttpClient } from '@angular/common/http';
import { fireEvent, render, within } from '@testing-library/angular';
import { UsernameFoundComponent } from './username-found.component';
import { getTestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { FindUsernameService } from '@core/services/find-username.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PageNoLongerAvailableComponent } from '@core/components/error/page-no-longer-available/page-no-longer-available.component';

describe('UsernameFoundComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(UsernameFoundComponent, {
      imports: [RouterModule],
      declarations: [PageNoLongerAvailableComponent],
      providers: [
        {
          provide: FindUsernameService,
          useValue: { usernameFound: overrides.username },
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {},
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { ...setupTools, component, routerSpy };
  };

  it('should create UsernameFoundComponent', async () => {
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

  it('should go back to the sign in page when the button is clicked', async () => {
    const overrides = {
      username: 'Bighitterhank1000',
    };

    const { fixture, getByText, routerSpy } = await setup(overrides);

    const buttonText = getByText('Back to sign in');
    expect(buttonText).toBeTruthy();

    fireEvent.click(buttonText);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should show page no longer available if no username was found', async () => {
    const overrides = {
      username: null,
    };

    const { getByTestId } = await setup(overrides);

    expect(getByTestId('page-no-longer-available')).toBeTruthy();
  });
});
