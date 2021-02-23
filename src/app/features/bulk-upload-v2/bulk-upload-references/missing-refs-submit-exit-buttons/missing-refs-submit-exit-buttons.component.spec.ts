import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { BulkUploadV2Module } from '@features/bulk-upload-v2/bulk-upload.module';
import { render } from '@testing-library/angular';

import { MissingRefsSubmitExitButtonsComponent } from './missing-refs-submit-exit-buttons.component';

describe('MissingRefsSubmitExitButtonsComponent', () => {
  const setup = async (isAdmin = false, isLoggedIn: boolean = true) => {
    const { fixture, getByText } = await render(MissingRefsSubmitExitButtonsComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BulkUploadV2Module],
      providers: [
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(isLoggedIn, isAdmin),
        },
      ],
      declarations: [MissingRefsSubmitExitButtonsComponent],
    });
    const component = fixture.componentInstance;

    return { component, getByText };
  };

  it('should render a MissingRefsSubmitExitButtonsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
