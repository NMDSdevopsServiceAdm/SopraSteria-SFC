import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { render } from '@testing-library/angular';

import { MissingRefsSubmitExitButtonsComponent } from './missing-refs-submit-exit-buttons.component';

describe('MissingRefsSubmitExitButtonsComponent', () => {
  const setup = async (isAdmin = false, isLoggedIn: boolean = true) => {
    const { fixture, getByText, queryByText } = await render(MissingRefsSubmitExitButtonsComponent, {
      imports: [RouterTestingModule, BrowserModule, BulkUploadModule],
      providers: [
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(isLoggedIn, isAdmin),
        },
      provideHttpClient(), provideHttpClientTesting(),],
      declarations: [MissingRefsSubmitExitButtonsComponent],
    });
    const component = fixture.componentInstance;

    return { component, queryByText };
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