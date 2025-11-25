import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { render } from '@testing-library/angular';

import { MissingRefsSubmitExitButtonsComponent } from './missing-refs-submit-exit-buttons.component';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';

describe('MissingRefsSubmitExitButtonsComponent', () => {
  const setup = async (isAdmin = false, isLoggedIn: boolean = true) => {
    const setupTools = await render(MissingRefsSubmitExitButtonsComponent, {
      imports: [BrowserModule, BulkUploadModule],
      providers: [
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(isLoggedIn, isAdmin),
        },
        AdminSkipService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      declarations: [MissingRefsSubmitExitButtonsComponent],
    });
    const component = setupTools.fixture.componentInstance;

    return { component, ...setupTools };
  };

  it('should render a MissingRefsSubmitExitButtonsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should not render Skip button if user is not admin', async () => {
    const { queryByText } = await setup();
    expect(queryByText('Skip')).toBeFalsy();
  });

  it('should render Skip button when user is admin', async () => {
    const { queryByText } = await setup(true);
    expect(queryByText('Skip')).toBeTruthy();
  });
});
