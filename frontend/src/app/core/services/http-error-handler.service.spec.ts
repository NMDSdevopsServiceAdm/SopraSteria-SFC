import { getTestBed } from '@angular/core/testing';
import { HttpErrorHandler } from './http-error-handler.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('HttpErrorHandler', () => {
  const setup = async () => {
    const injector = getTestBed();

    injector.configureTestingModule({
      providers: [{ provide: AuthService, useValue: {} }, provideHttpClient(), provideHttpClientTesting()],
    });

    const httpErrorHandler = injector.inject(HttpErrorHandler);
    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);
    spyOn(console, 'error'); // suppress error message in test log

    return { httpErrorHandler, routerSpy };
  };

  describe('handleHttpError', () => {
    it('should navigate to /problem-with-the-service page if got a 500 error', async () => {
      const { httpErrorHandler, routerSpy } = await setup();

      const mockHttpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {
          error: 'Failed to fetch content from CMS',
        },
      });

      httpErrorHandler.handleHttpError(mockHttpError).subscribe(
        () => {},
        (err) => {},
      );

      expect(routerSpy).toHaveBeenCalledWith(['/problem-with-the-service']);
    });

    it(`should not navigate if got a 500 error with response body containing {action: 'NO_REDIRECT'}`, async () => {
      const { httpErrorHandler, routerSpy } = await setup();

      const mockHttpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {
          error: 'Failed to fetch content from CMS',
          action: 'NO_REDIRECT',
        },
      });

      httpErrorHandler.handleHttpError(mockHttpError).subscribe(
        () => {},
        (err) => {},
      );

      expect(routerSpy).not.toHaveBeenCalled();
    });
  });
});
