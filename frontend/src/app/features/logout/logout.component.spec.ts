import { render } from '@testing-library/angular';
import { LogoutComponent } from './logout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';
import { AuthService } from '@core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';

describe('LogoutComponent', () => {
  async function setup(overrides: any = {}) {
    const activateRouteSettings = overrides?.activatedRoute ?? {};
    const mockActivatedRoute = new MockActivatedRoute(activateRouteSettings);

    const setupTools = await render(LogoutComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();

    const authService = injector.inject(AuthService) as AuthService;
    const authSpy = spyOn(authService, 'authenticate').and.callThrough();

    const fixture = setupTools.fixture;
    const component = fixture.componentInstance;

    return {
      ...setupTools,
      component,
      fixture,
      authService,
      authSpy,
    };
  }

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a message on sign out', async () => {
    const { getByText } = await setup();
    expect(getByText('You have been signed out.')).toBeTruthy();
  });

  it('should show a special message if signed out by 403 response from server', async () => {
    const { getByText } = await setup({ activatedRoute: { snapshot: { data: { got403FromServer: true } } } });
    expect(
      getByText('You have been signed out due to inactivity or your account permissions changed recently.'),
    ).toBeTruthy();
  });
});
