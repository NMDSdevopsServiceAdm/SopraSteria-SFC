import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-saved-confirmation',
  imports: [],
  templateUrl: './password-saved-confirmation.component.html',
})
export class PasswordSavedConfirmationComponent {
  constructor(protected router: Router) {}

  public backToSignInPage() {
    this.router.navigate(['/login']);
  }
}
