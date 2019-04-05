import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

import { AuthService } from './auth-service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorHandler {
  constructor(private router: Router, private messageService: MessageService, private authService: AuthService) {
    this.handleHttpError = this.handleHttpError.bind(this);
  }

  handleHttpError(error: HttpErrorResponse) {
    if (error.status === 403) {
      this.authService.logoutWithoutRouting();
      this.router.navigate(['/logged-out']);
      return;
    }
    const message =
      error.error instanceof ErrorEvent ? error.error.message : 'Server error. Please try again later, sorry.';

    if (isDevMode()) {
      console.error('HTTP error', error);
    }

    this.messageService.show('error', message);
    return throwError(message);
  }
}
